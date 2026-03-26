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

interface DomainConfiguredProps {
  domainName: string;
  businessName: string;
  dashboardUrl: string;
}

export default function DomainConfigured({
  domainName,
  businessName,
  dashboardUrl,
}: DomainConfiguredProps) {
  return (
    <Html>
      <Head />
      <Preview>Votre domaine {domainName} est configuré !</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Domaine configuré</Heading>
          <Text style={text}>
            Votre domaine <strong>{domainName}</strong> est désormais configuré
            et pointe vers votre site <strong>{businessName}</strong>.
          </Text>
          <Section style={card}>
            <div style={statusRow}>
              <Text style={statusLabel}>DNS</Text>
              <Text style={statusOk}>Configuré</Text>
            </div>
            <div style={statusRow}>
              <Text style={statusLabel}>SSL</Text>
              <Text style={statusOk}>Actif</Text>
            </div>
            <div style={statusRow}>
              <Text style={statusLabel}>Adresse</Text>
              <Link
                href={`https://${domainName}`}
                style={statusLink}
              >
                {domainName}
              </Link>
            </div>
          </Section>
          <Section style={buttonContainer}>
            <Link href={dashboardUrl} style={button}>
              Voir mon tableau de bord
            </Link>
          </Section>
          <Text style={text}>
            Votre site est maintenant accessible via votre domaine personnalisé.
            La propagation DNS peut prendre jusqu&apos;à 24h dans de rares cas.
          </Text>
          <Text style={footer}>
            &mdash; L&apos;équipe Masamune
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

const card = {
  backgroundColor: "#f1f5f9",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0",
};

const statusRow = {
  display: "flex" as const,
  justifyContent: "space-between" as const,
  padding: "4px 0",
};

const statusLabel = {
  color: "#64748b",
  fontSize: "13px",
  margin: "0",
};

const statusOk = {
  color: "#10b981",
  fontSize: "13px",
  fontWeight: "600" as const,
  margin: "0",
};

const statusLink = {
  color: "#4f46e5",
  fontSize: "13px",
  fontWeight: "600" as const,
  textDecoration: "none",
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
