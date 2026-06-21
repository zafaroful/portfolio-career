import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import type { User, Skill, Certification, Achievement, Project } from "@prisma/client";

type ResumeData = {
  user: User;
  skills: Skill[];
  certifications: Certification[];
  achievements: Achievement[];
  projects: Project[];
};

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10 },
  header: { marginBottom: 20 },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  bio: { fontSize: 11, color: "#444", marginBottom: 8 },
  section: { marginTop: 16, marginBottom: 8 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 4,
    marginBottom: 8,
  },
  row: { marginBottom: 6 },
  bold: { fontWeight: "bold" },
  tag: { fontSize: 9, color: "#555" },
});

function ModernResume({ data }: { data: ResumeData }) {
  const skillsByCategory = data.skills.reduce<Record<string, Skill[]>>(
    (acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    },
    {},
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.user.name}</Text>
          <Text style={styles.bio}>{data.user.bio ?? data.user.email}</Text>
        </View>

        {data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {Object.entries(skillsByCategory).map(([category, skills]) => (
              <View key={category} style={styles.row}>
                <Text style={styles.bold}>{category}: </Text>
                <Text>
                  {skills.map((s) => `${s.name} (${s.proficiency})`).join(", ")}
                </Text>
              </View>
            ))}
          </View>
        )}

        {data.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {data.projects.map((p) => (
              <View key={p.id} style={styles.row}>
                <Text style={styles.bold}>{p.title}</Text>
                {p.role && <Text style={styles.tag}>{p.role}</Text>}
                {p.description && <Text>{p.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {data.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {data.certifications.map((c) => (
              <View key={c.id} style={styles.row}>
                <Text style={styles.bold}>{c.title}</Text>
                <Text>{c.issuer}</Text>
              </View>
            ))}
          </View>
        )}

        {data.achievements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            {data.achievements.map((a) => (
              <View key={a.id} style={styles.row}>
                <Text style={styles.bold}>{a.title}</Text>
                {a.description && <Text>{a.description}</Text>}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}

function ClassicResume({ data }: { data: ResumeData }) {
  return (
    <Document>
      <Page size="A4" style={{ ...styles.page, fontFamily: "Times-Roman" }}>
        <View style={styles.header}>
          <Text style={{ ...styles.name, textAlign: "center" }}>
            {data.user.name}
          </Text>
          <Text style={{ textAlign: "center", marginBottom: 16 }}>
            {data.user.email}
          </Text>
        </View>

        {data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            <Text>
              {data.skills.map((s) => s.name).join(" • ")}
            </Text>
          </View>
        )}

        {data.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience & Projects</Text>
            {data.projects.map((p) => (
              <View key={p.id} style={styles.row}>
                <Text style={styles.bold}>{p.title}</Text>
                <Text>{p.description}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function generateResumePdf(
  data: ResumeData,
  templateId: "modern" | "classic",
): Promise<Buffer> {
  const component =
    templateId === "classic"
      ? React.createElement(ClassicResume, { data })
      : React.createElement(ModernResume, { data });

  // @ts-expect-error react-pdf Document typing mismatch with createElement
  const blob = await pdf(component).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
