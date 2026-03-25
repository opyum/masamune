import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  email: string;
}

export default function WelcomeEmail({ email }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenue sur Masamune — creez votre site en 5 minutes</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Bienvenue sur Masamune</Heading>
          <Text style={text}>
            Bonjour,
          </Text>
          <Text style={text}>
            Votre compte a ete cree avec l&apos;adresse{" "}
            <strong>{email}</strong>. Vous pouvez maintenant creer votre site
            professionnel en quelques minutes.
          </Text>
          <Section style={buttonContainer}>
            <Link
              href={`${process.env.SITE_URL || "https://masamune.fr"}/dashboard/new`}
              style={button}
            >
              Creer mon premier site
            </Link>
          </Section>
          <Text style={text}>
            Repondez simplement aux questions de notre IA, et votre site sera en
            ligne en 5 minutes. Aucune competence technique requise.
          </Text>
          <Text style={footer}>
            &mdash; L&apos;equipe Masamune
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f8fafc",
  fontFamily: "Inter, system-ui, sans-serif",
};

const container = {
  maxWidth: "560px",
  margin: "40px auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "40px",
};

const h1 = {
  color: "#1e293b",
  fontSize: "24px",
  fontWeight: "700" as const,
  margin: "0 0 24px",
};

const text = {
  color: "#334155",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#4f46e5",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600" as const,
  padding: "12px 24px",
  textDecoration: "none",
};

const footer = {
  color: "#94a3b8",
  fontSize: "12px",
  margin: "32px 0 0",
};
