import { api } from "../api/client";

const API_BASE = import.meta.env.VITE_API_URL || "/api";
const IS_DEMO = import.meta.env.VITE_DEMO_MODE !== "false";

export const digitalAssetApi = {
  uploadDigitalAsset: async (formData: FormData) => {
    if (IS_DEMO) {
      const file = formData.get("file") as File;
      const payload = {
        userId: formData.get("ownerId"),
        assetName: formData.get("assetName"),
        assetDescription: formData.get("description"),
        fileName: file ? file.name : undefined,
      };
      return await api.post("/assets", payload);
    }
    return await api.postFormData("/assets/upload", formData);
  },

  getDigitalAssets: async () => {
    return await api.get("/assets");
  },

  getDigitalAsset: async (assetId: string) => {
    return await api.get(`/assets/${assetId}`);
  },

  getDigitalAssetFileUrl: (assetId: string) => {
    if (IS_DEMO) {
      // In demo mode, return a dummy image placeholder
      return "https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&q=80&w=1000";
    }
    return `${API_BASE}/assets/${assetId}/file`;
  },

  verifyDigitalAsset: async (assetId: string) => {
    if (IS_DEMO) {
      // Mock successful verification in demo mode
      await new Promise(resolve => setTimeout(resolve, 800));
      return { success: true };
    }
    return await api.get(`/assets/${assetId}/verify`);
  }
};