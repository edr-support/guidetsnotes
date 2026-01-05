import { InvestigationSchema } from '../types/schema';

export const generateMarkdown = (schema: InvestigationSchema, answers: Record<string, any>) => {
  let markdown = `# ${schema.title}\n`;
  markdown += `*Report Generated: ${new Date().toLocaleString()}*\n\n---\n\n`;

  schema.steps.forEach((step) => {
    const hasAnswers = step.fields.some(f => answers[f.id]);
    if (!hasAnswers) return;

    markdown += `## ${step.title}\n`;
    
    step.fields.forEach((field) => {
      const answer = answers[field.id];
      if (!answer) return;

      markdown += `### ${field.label}\n`;

      if (field.type === 'code') {
        markdown += `\`\`\`\n${answer}\n\`\`\`\n\n`;
      } else if (field.type === 'image') {
        // Embeds the Base64 image data directly into Markdown
        markdown += `![Evidence Screenshot](${answer})\n\n`;
      } else {
        markdown += `${answer}\n\n`;
      }
    });
    
    markdown += `---\n\n`;
  });

  return markdown;
};