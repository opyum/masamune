const GITHUB_API = "https://api.github.com";
const GITHUB_ORG = "opyum";

export async function createSiteRepo(
  slug: string,
  files: Record<string, string>
): Promise<string> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not configured");

  const repoName = `msm-${slug}`;
  const headers = {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };

  // 1. Create private repo under org
  const createRes = await fetch(`${GITHUB_API}/orgs/${GITHUB_ORG}/repos`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: repoName,
      private: true,
      auto_init: true,
      description: `Masamune site: ${slug}`,
    }),
  });

  if (!createRes.ok && createRes.status !== 422) {
    // 422 = already exists, which is fine
    const err = await createRes.text();
    throw new Error(`GitHub create repo failed: ${createRes.status} ${err}`);
  }

  // Wait briefly for repo initialization
  await new Promise((r) => setTimeout(r, 2000));

  // 2. Get the default branch SHA
  const refRes = await fetch(
    `${GITHUB_API}/repos/${GITHUB_ORG}/${repoName}/git/ref/heads/main`,
    { headers }
  );
  if (!refRes.ok) {
    throw new Error(`GitHub get ref failed: ${refRes.status}`);
  }
  const refData = await refRes.json();
  const baseSha = refData.object.sha;

  // 3. Get the base tree
  const commitRes = await fetch(
    `${GITHUB_API}/repos/${GITHUB_ORG}/${repoName}/git/commits/${baseSha}`,
    { headers }
  );
  if (!commitRes.ok) {
    throw new Error(`GitHub get commit failed: ${commitRes.status}`);
  }
  const commitData = await commitRes.json();
  const baseTreeSha = commitData.tree.sha;

  // 4. Create blobs for each file
  const tree = [];
  for (const [path, content] of Object.entries(files)) {
    const blobRes = await fetch(
      `${GITHUB_API}/repos/${GITHUB_ORG}/${repoName}/git/blobs`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: Buffer.from(content).toString("base64"),
          encoding: "base64",
        }),
      }
    );
    if (!blobRes.ok) {
      throw new Error(`GitHub create blob failed for ${path}: ${blobRes.status}`);
    }
    const blobData = await blobRes.json();
    tree.push({
      path,
      mode: "100644",
      type: "blob",
      sha: blobData.sha,
    });
  }

  // 5. Create tree
  const treeRes = await fetch(
    `${GITHUB_API}/repos/${GITHUB_ORG}/${repoName}/git/trees`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ base_tree: baseTreeSha, tree }),
    }
  );
  if (!treeRes.ok) {
    throw new Error(`GitHub create tree failed: ${treeRes.status}`);
  }
  const treeData = await treeRes.json();

  // 6. Create commit
  const newCommitRes = await fetch(
    `${GITHUB_API}/repos/${GITHUB_ORG}/${repoName}/git/commits`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        message: "Initial site generation by Masamune",
        tree: treeData.sha,
        parents: [baseSha],
      }),
    }
  );
  if (!newCommitRes.ok) {
    throw new Error(`GitHub create commit failed: ${newCommitRes.status}`);
  }
  const newCommitData = await newCommitRes.json();

  // 7. Update ref
  const updateRefRes = await fetch(
    `${GITHUB_API}/repos/${GITHUB_ORG}/${repoName}/git/refs/heads/main`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({ sha: newCommitData.sha }),
    }
  );
  if (!updateRefRes.ok) {
    throw new Error(`GitHub update ref failed: ${updateRefRes.status}`);
  }

  return `https://github.com/${GITHUB_ORG}/${repoName}`;
}
