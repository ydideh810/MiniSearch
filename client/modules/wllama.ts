import {
  DownloadModelConfig,
  Wllama,
  WllamaConfig,
  SamplingConfig,
} from "@wllama/wllama/esm";
import singleThreadWllamaJsUrl from "@wllama/wllama/esm/single-thread/wllama.js?url";
import singleThreadWllamaWasmUrl from "@wllama/wllama/esm/single-thread/wllama.wasm?url";
import multiThreadWllamaJsUrl from "@wllama/wllama/esm/multi-thread/wllama.js?url";
import multiThreadWllamaWasmUrl from "@wllama/wllama/esm/multi-thread/wllama.wasm?url";
import multiThreadWllamaWorkerMjsUrl from "@wllama/wllama/esm/multi-thread/wllama.worker.mjs?url";
import { getNumberOfThreadsSetting } from "./pubSub";

export async function initializeWllama(
  modelUrl: string | string[],
  config?: {
    wllama?: WllamaConfig;
    model?: DownloadModelConfig;
  },
) {
  const wllama = new Wllama(
    {
      "single-thread/wllama.js": singleThreadWllamaJsUrl,
      "single-thread/wllama.wasm": singleThreadWllamaWasmUrl,
      "multi-thread/wllama.js": multiThreadWllamaJsUrl,
      "multi-thread/wllama.wasm": multiThreadWllamaWasmUrl,
      "multi-thread/wllama.worker.mjs": multiThreadWllamaWorkerMjsUrl,
    },
    config?.wllama,
  );

  await wllama.loadModelFromUrl(modelUrl, config?.model);

  return wllama;
}

const commonSamplingConfig: SamplingConfig = {
  temp: 0.2,
  dynatemp_range: 0.15,
  top_k: 0,
  top_p: 1,
  min_p: 0.1,
  typical_p: 0.85,
  penalty_repeat: 1.176,
  penalty_last_n: -1,
  mirostat: 2,
  mirostat_tau: 3.5,
};

export const availableModels: {
  [key in "mobile" | "mobileFallback" | "desktop"]: {
    url: string | string[];
    stopStrings: string[];
    cacheType: "f16" | "q8_0" | "q4_0";
    contextSize: number;
    sampling: SamplingConfig;
    shouldIncludeUrlsOnPrompt: boolean;
    buildPrompt: (query: string, searchResults: string) => string;
  };
} = {
  mobile: {
    url: "https://huggingface.co/Felladrin/gguf-q5_k_m-imat-qwen2-0.5b-instruct/resolve/main/qwen2-0-00001-of-00003.gguf",
    buildPrompt: (query, searchResults) => `${searchResults}<|im_end|>
<|im_start|>user
${query}<|im_end|>
<|im_start|>assistant
`,
    stopStrings: [],
    cacheType: "f16",
    contextSize: 2048,
    shouldIncludeUrlsOnPrompt: false,
    sampling: commonSamplingConfig,
  },
  mobileFallback: {
    url: "https://huggingface.co/Felladrin/gguf-sharded-Qwen1.5-0.5B-Chat_llamafy/resolve/main/Qwen1.5-0.5B-Chat_llamafy.IQ3_XXS.shard-00001-of-00003.gguf",
    buildPrompt: (query, searchResults) => `${searchResults}<|im_end|>
<|im_start|>user
${query}<|im_end|>
<|im_start|>assistant
`,
    stopStrings: [],
    cacheType: "f16",
    contextSize: 1280,
    shouldIncludeUrlsOnPrompt: false,
    sampling: commonSamplingConfig,
  },
  desktop:
    getNumberOfThreadsSetting() < 4
      ? {
          url: "https://huggingface.co/Felladrin/gguf-q5_k_m-imat-qwen2-0.5b-instruct/resolve/main/qwen2-0-00001-of-00003.gguf",
          buildPrompt: (query, searchResults) => `${searchResults}<|im_end|>
<|im_start|>user
${query}<|im_end|>
<|im_start|>assistant
`,
          stopStrings: [],
          cacheType: "f16",
          contextSize: 2048,
          shouldIncludeUrlsOnPrompt: false,
          sampling: commonSamplingConfig,
        }
      : {
          url: "https://huggingface.co/Felladrin/gguf-q5_k_l-imat-arcee-lite/resolve/main/arcee-lite-Q5_K_L.shard-00001-of-00006.gguf",
          buildPrompt: (query, searchResults) => `${searchResults}<|im_end|>
<|im_start|>user
${query}<|im_end|>
<|im_start|>assistant
`,
          stopStrings: [],
          cacheType: "f16",
          contextSize: 2048,
          shouldIncludeUrlsOnPrompt: false,
          sampling: commonSamplingConfig,
        },
};
