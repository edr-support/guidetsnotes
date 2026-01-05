import { InvestigationSchema } from '../types/schema';

export const generateMarkdown = (schema: InvestigationSchema, answers: Record<string, any>) => {
  let markdown = `# Investigation Report: ${schema.title}\n`;
  markdown += `*Generated on: ${new Date().toLocaleString()}*\n\n---\n\n`;

  schema.steps.forEach((step) => {
    markdown += `## ${step.title}\n`;
    
    step.fields.forEach((field) => {
      const answer = answers[field.id];
      if (!answer) return;

      markdown += `### ${field.label}\n`;

      if (field.type === 'code') {
        markdown += `\`\`\`\n${answer}\n\`\`\`\n\n`;
      } else if (field.type === 'image') {
        markdown += `*Image evidence provided (see attached PDF or original form)*\n\n`;
      } else {
        markdown += `${answer}\n\n`;
      }
    });
    
    markdown += `---\n\n`;
  });

  return markdown;
};
