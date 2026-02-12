import { api } from './api';

export const generateAIContent = async (prompt: string, systemPrompt: string = "You are a helpful admin assistant.", task: string = "chat") => {
  try {
    const response = await api.ai.generate({
      prompt: prompt,
      systemPrompt: systemPrompt,
      task: task
    });

    return response.content || response.result || response;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};

export const generateProductDescription = async (productName: string, features: string[]) => {
  const prompt = `Generate a compelling SEO-friendly product description for "${productName}" with these features: ${features.join(', ')}. Include 5 SEO tags at the end.`;
  return generateAIContent(prompt, "You are an expert copywriter and SEO specialist.", "write");
};

export const chatWithAssistant = async (message: string, contextData: string) => {
  // Pass contextData (Page Info) to the AI
  const systemContext = contextData ? `[Current Page Context]\n${contextData}\n\n` : "";
  const fullMessage = `${systemContext}${message}`;
  
  // Enforce Indonesian Language via System Prompt
  const systemPrompt = "Anda adalah asisten admin yang cerdas dan membantu. Anda WAJIB menjawab semua pertanyaan dalam BAHASA INDONESIA yang baik, benar, dan sopan. Gunakan format paragraf yang jelas. Jika diminta membuat konten, pastikan hasilnya siap pakai.";

  return generateAIContent(fullMessage, systemPrompt, "assistant");
};
