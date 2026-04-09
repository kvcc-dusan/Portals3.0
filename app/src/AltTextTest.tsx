/**
 * AltTextTest — Portals CMS prototype
 *
 * Demonstrates AI-powered alt text generation for CMS media fields.
 *
 * HOW IT WORKS:
 *  1. User uploads an image (drag & drop or click) in the right panel → MediaCard
 *  2. Frontend converts it to base64 and POSTs to the Express backend at :3001
 *  3. Backend sends the image to Gemini Vision (gemini-2.5-flash) with an
 *     accessibility-focused prompt
 *  4. Gemini returns a concise alt text string, which is displayed in the ALT field
 *
 * KEY FILES:
 *  - app/src/AltTextTest.tsx  → this file (UI + fetch logic)
 *  - backend/server.js        → Express API, Gemini integration
 *  - backend/.env             → GEMINI_API_KEY goes here
 *
 * The UI is a static mockup of a CMS editor (Portals). Only the MediaCard
 * components in the right panel are interactive — everything else is visual chrome.
 */
import { useState, useRef } from 'react';

const imgSettings = "https://www.figma.com/api/mcp/asset/dad1fcda-d012-4ed9-ac0b-d28d9923da30";
const imgLoading = "https://www.figma.com/api/mcp/asset/9fbd342e-1ca6-41a6-aa50-0312ee599be0";
const imgEllipse52 = "https://www.figma.com/api/mcp/asset/012c19d4-2d67-4f15-b4eb-bb564e93ef02";
const imgUserpfp = new URL('./assets/profile.png', import.meta.url).href;
const imgClipPathGroup1 = new URL('./assets/pic.png', import.meta.url).href;
const imgGroup238 = "https://www.figma.com/api/mcp/asset/b4eabccc-66b4-4333-9469-cbfc01225e2a";
const imgGroup239 = "https://www.figma.com/api/mcp/asset/a00fd4a7-a9a3-4d89-a221-23685ce0991d";
const imgEllipse53 = "https://www.figma.com/api/mcp/asset/9f03306d-8105-41da-be2b-19d6bd7c1dbe";
const imgEllipse54 = "https://www.figma.com/api/mcp/asset/ceaf55cf-ac52-4071-8f78-3819a3471874";
const imgEllipse55 = "https://www.figma.com/api/mcp/asset/c603b926-d434-4b84-b83e-ffb0484f85d7";
const imgIconexLightDown2 = "https://www.figma.com/api/mcp/asset/75812d28-29e8-4fa2-9795-1420a40756bd";
const imgIconexLightDown3 = "https://www.figma.com/api/mcp/asset/d6bee2e9-8102-4b11-b83b-610049d5fd93";
const imgIconexLightDown4 = "https://www.figma.com/api/mcp/asset/3916674b-2948-41ca-821f-bde683fa06c8";
const imgIconexLightDown5 = "https://www.figma.com/api/mcp/asset/f4dff4d1-7598-454a-85f8-b0bf2c67a2d9";
const imgIconexLightDown6 = "https://www.figma.com/api/mcp/asset/8d2eb0bb-81c0-4646-91bc-604f9704d3a8";
const imgAdd = "https://www.figma.com/api/mcp/asset/8a4341a7-e0e4-4815-8c3d-b2ca5bbe0147";
const imgDivider = "https://www.figma.com/api/mcp/asset/ec1aaa09-11ea-4be9-b61c-fc737e9eb3f8";
const imgArrowUp = "https://www.figma.com/api/mcp/asset/ff9ac80d-0c0c-4381-9ee6-2e8a39d9b431";
const imgTrash = "https://www.figma.com/api/mcp/asset/ed8f5a0a-e13e-441d-862d-d5e27024f490";
const imgUndo = "https://www.figma.com/api/mcp/asset/35e6cffb-93f9-4fa0-801d-6fb02bbdf231";
const imgRedo = "https://www.figma.com/api/mcp/asset/00f41b68-7292-48a6-9b5d-4d7de3d9f8aa";
const imgEye = "https://www.figma.com/api/mcp/asset/2b6b7adb-f9f1-41d5-8a7d-c6f49d7f697d";
const imgLaptop = "https://www.figma.com/api/mcp/asset/5fc81d29-8e5a-4302-9c9c-761253d99226";
const imgPhone = "https://www.figma.com/api/mcp/asset/a410a1d1-b37a-4f1a-b696-6421145ee961";
const imgPhoneSmall = "https://www.figma.com/api/mcp/asset/76808815-26fd-48c7-858c-3bfcc189370c";
const imgExpand = "https://www.figma.com/api/mcp/asset/d5307d1a-3970-45bc-b954-5be2237c28de";
const imgLogo = "https://www.figma.com/api/mcp/asset/ddfe35a8-4865-419c-ba11-507f9045de8d";
const imgMaskGroup = "https://www.figma.com/api/mcp/asset/c866f6ba-cf21-4932-b3a4-f453ed96373c";
const imgMaskGroup1 = "https://www.figma.com/api/mcp/asset/5d28e914-e33f-4cf5-aa4e-ff0cd7b241ee";
const imgMaskGroup2 = "https://www.figma.com/api/mcp/asset/2427c6d6-2f1e-4589-94ee-0110fd20f7d9";
const imgDeleteX = "https://www.figma.com/api/mcp/asset/44e91860-08c3-4165-afc6-752473541394";
const imgCollapseX = "https://www.figma.com/api/mcp/asset/6027d5a0-0eb0-4719-838f-ae0a7505af69";
const imgResizeHandle = "https://www.figma.com/api/mcp/asset/c4224199-db0c-4a58-9b8a-7ff9f25ee086";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SettingsIcon({ className }: { className?: string }) {
  return (
    <div className={className ?? "relative size-[24px]"}>
      <div className="absolute h-[20px] left-[2.52px] top-[2px] w-[18.964px]">
        <div className="absolute inset-[-3.75%_-3.96%_-3.75%_-3.97%]">
          <img alt="Settings" className="block max-w-none size-full" src={imgSettings} />
        </div>
      </div>
    </div>
  );
}

function LoadingIcon({ className }: { className?: string }) {
  return (
    <div className={className ?? "relative size-[24px]"}>
      <div className="absolute inset-[8.33%]">
        <div className="absolute inset-[-3.75%]">
          <img alt="Loading" className="block max-w-none size-full" src={imgLoading} />
        </div>
      </div>
    </div>
  );
}

function CollapseIcon({ open }: { open?: boolean }) {
  return (
    <div className="relative shrink-0 size-[14px]">
      {open ? (
        <div className="absolute h-0 left-[3px] top-[7px] w-[8px]">
          <div className="absolute inset-[-0.75px_0]">
            <img alt="" className="block max-w-none size-full" src={imgGroup238} />
          </div>
        </div>
      ) : (
        <div className="absolute left-[3px] size-[8px] top-[3px]">
          <img alt="" className="absolute block max-w-none size-full" src={imgGroup239} />
        </div>
      )}
    </div>
  );
}

function StagingBadge() {
  return (
    <div className="bg-black border border-[#181818] border-solid flex items-center gap-[8px] px-[16px] py-[8px] rounded-[64px]">
      <div className="relative shrink-0 size-[6px]">
        <img alt="" className="absolute block max-w-none size-full" src={imgEllipse52} />
      </div>
      <p
        className="font-normal leading-none text-[#d2d2d2] text-[16px] whitespace-nowrap"
        style={{ fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" }}
      >
        Staging
      </p>
    </div>
  );
}

// Reusable media card — fully interactive: upload, preview, generate alt text via Gemini
function MediaCard() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load a File object → base64 data URL for preview
  const handleFile = (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageDataUrl(e.target?.result as string);
      setAltText('');
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // Clear image so user can upload a different one
  const clearImage = () => {
    setImageDataUrl(null);
    setAltText('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Send image to backend → get AI-generated alt text
  const handleGenerate = async () => {
    if (!imageDataUrl || isGenerating) return;
    setIsGenerating(true);
    setError(null);
    try {
      // Strip the "data:image/jpeg;base64," prefix — backend wants raw base64
      const base64 = imageDataUrl.split(',')[1];
      const mimeType = imageDataUrl.split(';')[0].split(':')[1];
      // In dev: proxy via vite config. In prod (Vercel): same-origin /api route.
      const res = await fetch('/api/generate-alt-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setAltText(data.altText);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="border border-[#181818] border-solid flex flex-col gap-[16px] items-center py-[16px] rounded-[8px] w-[260px]">
      {/* Order controls */}
      <div className="flex flex-col items-end w-[244px]">
        <div className="flex gap-[16px] items-center justify-center">
          <div className="flex items-center justify-center size-[16px]">
            <div className="rotate-90">
              <div className="relative size-[16px]">
                <img alt="" className="absolute block max-w-none size-full" src={imgIconexLightDown6} />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center size-[16px]">
            <div className="-rotate-90 -scale-y-100">
              <div className="relative size-[16px]">
                <img alt="" className="absolute block max-w-none size-full" src={imgIconexLightDown5} />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center size-[16px]">
            <div className="rotate-90">
              <div className="relative size-[16px]">
                <div className="-translate-x-1/2 -translate-y-1/2 absolute flex items-center justify-center left-1/2 size-[8px] top-1/2">
                  <div className="-rotate-90">
                    <div className="overflow-clip relative size-[8px]">
                      <div className="absolute inset-[12.5%]">
                        <div className="absolute inset-[-12.5%]">
                          <img alt="" className="block max-w-none size-full" src={imgDeleteX} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IMAGE field — drag & drop or click to upload */}
      <div className="flex flex-col gap-[8px] items-start w-[244px]">
        <p
          className="font-normal leading-none text-[#727272] text-[12px] uppercase"
          style={{ fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" }}
        >
          image
        </p>
        <div className="flex h-[184px] items-center w-full">
          <div
            className="border-[0.5px] border-solid h-[184px] overflow-clip relative rounded-[8px] w-[244px] transition-colors"
            style={{
              borderColor: isDragOver ? '#444' : '#181818',
              cursor: imageDataUrl ? 'default' : 'pointer',
            }}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            onClick={() => { if (!imageDataUrl) fileInputRef.current?.click(); }}
          >
            {/* Background */}
            <div
              className="absolute inset-0 rounded-[8px] transition-colors"
              style={{ background: isDragOver ? '#1c1c1c' : '#0f0f0f' }}
            />

            {/* Image preview OR upload prompt */}
            {imageDataUrl ? (
              <img
                alt="Uploaded"
                className="absolute inset-0 max-w-none object-cover rounded-[8px] size-full"
                src={imageDataUrl}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-[8px]">
                <p
                  className="text-center px-4"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '11px',
                    color: isDragOver ? '#d2d2d2' : '#505050',
                    lineHeight: '1.5',
                  }}
                >
                  {isDragOver ? 'Drop to upload' : 'Drag & drop or click to upload'}
                </p>
              </div>
            )}

            {/* X button — clear image so user can replace it */}
            {imageDataUrl && (
              <div
                className="absolute bg-[rgba(15,15,15,0.6)] right-[7.5px] rounded-[40px] size-[14px] top-[7.5px] cursor-pointer"
                style={{ zIndex: 10 }}
                onClick={(e) => { e.stopPropagation(); clearImage(); }}
              >
                <div className="absolute flex items-center justify-center left-[2.85px] size-[8.304px] top-[2.85px]">
                  <div className="-rotate-45">
                    <div className="relative size-[5.872px]">
                      <div className="absolute inset-[-8.52%_-8.51%_-8.51%_-8.52%]">
                        <img alt="Remove" className="block max-w-none size-full" src={imgCollapseX} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>
        </div>
      </div>

      {/* ALT field */}
      <div className="flex flex-col gap-[8px] items-start w-[244px]">
        <div className="flex items-center justify-between w-full">
          <p
            className="font-normal leading-none text-[#727272] text-[12px] uppercase"
            style={{ fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" }}
          >
            alt
          </p>
          {/* Generate button — disabled until image is loaded */}
          <button
            onClick={handleGenerate}
            disabled={!imageDataUrl || isGenerating}
            className="border border-solid flex items-center justify-center gap-[6px] px-[16px] py-[4px] rounded-[100px] transition-opacity"
            style={{
              borderColor: '#181818',
              opacity: imageDataUrl ? 1 : 0.35,
              cursor: imageDataUrl && !isGenerating ? 'pointer' : 'default',
              background: 'transparent',
            }}
          >
            {isGenerating && (
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  border: '1.5px solid #727272',
                  borderTopColor: '#f7f7f7',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
            )}
            <p
              className="font-medium leading-none text-[#f7f7f7] text-[12px] text-center tracking-[-0.24px] whitespace-nowrap"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {isGenerating ? 'Generating…' : 'Generate'}
            </p>
          </button>
        </div>

        {/* Alt text output — fills in after generation */}
        <div className="bg-[#0f0f0f] border-[#181818] border-[0.5px] border-solid flex items-start overflow-clip p-[8px] rounded-[8px] w-full" style={{ minHeight: 40 }}>
          <p
            className="font-normal leading-[24px] text-[14px]"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: altText ? '#d2d2d2' : '#505050',
              whiteSpace: altText ? 'normal' : 'nowrap',
            }}
          >
            {altText || (error ? '' : 'Alt text will appear here…')}
          </p>
        </div>

        {/* Inline error message */}
        {error && (
          <p
            className="text-[11px] leading-[1.4]"
            style={{ fontFamily: "'Inter', sans-serif", color: '#e05c5c' }}
          >
            {error}
          </p>
        )}
      </div>

      {/* CAPTION field */}
      <div className="flex flex-col gap-[8px] items-start w-[244px]">
        <div className="flex items-center justify-between w-full h-[20px]">
          <p
            className="font-normal leading-none text-[#727272] text-[12px] uppercase"
            style={{ fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" }}
          >
            caption
          </p>
          <div className="border border-[#181818] border-solid flex items-center justify-center px-[16px] py-[4px] rounded-[100px]">
            <p
              className="font-medium leading-none text-[#f7f7f7] text-[12px] text-center tracking-[-0.24px] whitespace-nowrap"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Edit
            </p>
          </div>
        </div>
        <div className="bg-[#0f0f0f] border-[#181818] border-[0.5px] border-solid flex gap-[8px] items-center overflow-clip p-[8px] relative rounded-[8px] w-full">
          <p
            className="flex-1 font-normal leading-[24px] text-[#d2d2d2] text-[14px]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="absolute bottom-[3.5px] right-[3.5px] size-[6px]">
            <div className="absolute bottom-[0.76px] h-[5.243px] right-[0.88px] w-[5.121px]">
              <div className="absolute inset-[-9.53%_-9.76%_-9.54%_-9.76%]">
                <img alt="" className="block max-w-none size-full" src={imgResizeHandle} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AltTextTest() {
  return (
    <div className="bg-[#0f0f0f] relative" style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>

      {/* ── Left Sidebar ──────────────────────────────────────────── */}
      <div
        className="absolute bg-black border-[#181818] border-r border-solid flex flex-col items-center overflow-clip"
        style={{ left: 0, top: 105, width: 240, bottom: 0 }}
      >
        {/* PAGES section header */}
        <div className="flex flex-col items-start py-[16px] w-full">
          <div className="flex flex-col h-[14px] items-start justify-center px-[16px] w-full">
            <div className="flex gap-[8px] items-center w-full">
              <div className="flex flex-1 items-center min-w-0">
                <p
                  className="font-semibold leading-none text-[#727272] text-[14px] uppercase whitespace-nowrap"
                  style={{ fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" }}
                >
                  pages
                </p>
              </div>
              <CollapseIcon open />
            </div>
          </div>
        </div>

        {/* Page links */}
        <div className="border-[#181818] border-b border-solid flex flex-col gap-[8px] items-start pb-[16px] w-full">
          {[
            { label: "Home", active: true },
            { label: "Impact" },
            { label: "Projects" },
            { label: "About Us" },
            { label: "Archive" },
          ].map(({ label, active }) => (
            <div key={label} className="flex items-center px-[16px] py-[8px] w-full">
              <p
                className="font-normal leading-none text-[14px] whitespace-nowrap"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1",
                  color: active ? "#d2d2d2" : "#727272",
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* ARTICLES */}
        <div className="border-[#181818] border-b border-solid flex flex-col items-start py-[16px] w-full">
          <div className="flex gap-[8px] items-center px-[16px] w-full">
            <p
              className="flex-1 font-semibold leading-none text-[#727272] text-[14px] uppercase"
              style={{ fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" }}
            >
              Articles
            </p>
            <CollapseIcon />
          </div>
        </div>

        {/* TEAM MEMBERS */}
        <div className="border-[#181818] border-b border-solid flex flex-col items-start py-[16px] w-full">
          <div className="flex gap-[8px] items-center px-[16px] w-full">
            <p
              className="flex-1 font-semibold leading-none text-[#727272] text-[14px] uppercase"
              style={{ fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" }}
            >
              TEAM members
            </p>
            <CollapseIcon />
          </div>
        </div>

        {/* PAGE STRUCTURE */}
        <div className="border-[#181818] border-b border-solid flex flex-col gap-[16px] items-start py-[16px] w-full">
          <div className="flex items-center px-[16px] w-full">
            <p
              className="flex-1 font-semibold leading-none text-[#727272] text-[14px] uppercase"
              style={{ fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" }}
            >
              page structure
            </p>
            <CollapseIcon open />
          </div>
          <div className="flex flex-col gap-[8px] items-start w-full">
            {[
              { label: "Navigation", dot: imgEllipse53 },
              { label: "Hero", dot: imgEllipse53 },
              { label: "Features", dot: imgEllipse53 },
              { label: "Social Proof", dot: imgEllipse54 },
              { label: "Footer", dot: imgEllipse53 },
            ].map(({ label, dot }) => (
              <div key={label} className="flex items-center gap-[8px] px-[16px] py-[8px] w-full">
                <div className="relative shrink-0 size-[4px]">
                  <img alt="" className="absolute block max-w-none size-full" src={dot} />
                </div>
                <p
                  className="font-normal leading-none text-[#727272] text-[14px] whitespace-nowrap"
                  style={{ fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* COMPONENTS */}
        <div className="border-[#181818] border-b border-solid flex flex-col gap-[24px] items-start py-[16px] w-full">
          <div className="flex items-center px-[16px] w-full">
            <p
              className="flex-1 font-semibold leading-none text-[#727272] text-[14px] uppercase"
              style={{ fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" }}
            >
              Components
            </p>
            <CollapseIcon open />
          </div>
          <div className="flex flex-col gap-[24px] w-full">
            {/* Layout group */}
            <div className="flex flex-col gap-[8px] w-full">
              <div className="px-[16px]">
                <p
                  className="font-medium leading-none text-[#727272] text-[12px] uppercase"
                  style={{ fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" }}
                >
                  Layout
                </p>
              </div>
              {["Spacer", "Hero", "Call to Action"].map((label) => (
                <div key={label} className="px-[16px] py-[8px]">
                  <p
                    className="font-normal leading-none text-[#d2d2d2] text-[14px] whitespace-nowrap"
                    style={{ fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
            {/* Content group */}
            <div className="flex flex-col gap-[8px] w-full">
              <div className="px-[16px]">
                <p
                  className="font-medium leading-none text-[#727272] text-[12px] uppercase"
                  style={{ fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" }}
                >
                  Content
                </p>
              </div>
              {["Text", "Image", "Gallery"].map((label) => (
                <div key={label} className="px-[16px] py-[8px]">
                  <p
                    className="font-normal leading-none text-[#d2d2d2] text-[14px] whitespace-nowrap"
                    style={{ fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Navigation Bar ────────────────────────────────────── */}
      <div
        className="absolute bg-black border-[#181818] border-b border-solid flex flex-col items-start px-[16px] pt-[40px] pb-[25px]"
        style={{ left: 0, top: 0, right: 0, zIndex: 30 }}
      >
        <div className="relative h-[40px] w-full">
          {/* Left: project switcher + logo */}
          <div className="absolute flex gap-[24px] items-center left-0 top-0">
            <div className="border border-[#181818] border-solid flex items-center gap-[8px] h-[40px] px-[16px] py-[2px] rounded-[64px]">
              <div className="relative size-[20px]">
                <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[16px] left-[calc(50%+0.5px)] overflow-clip top-1/2 w-[15px]">
                  <div className="absolute inset-[0_3.17%_25.97%_33.33%]">
                    <img alt="" className="absolute block max-w-none size-full" src={imgMaskGroup} />
                  </div>
                  <div className="absolute inset-[10.4%_19.84%_15.58%_16.67%]">
                    <img alt="" className="absolute block max-w-none size-full" src={imgMaskGroup1} />
                  </div>
                  <div className="absolute inset-[25.39%_36.51%_0.58%_0]">
                    <img alt="" className="absolute block max-w-none size-full" src={imgMaskGroup2} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center size-[20px]">
                <div className="-rotate-90 -scale-y-100">
                  <div className="relative size-[20px]">
                    <img alt="" className="absolute block max-w-none size-full" src={imgIconexLightDown4} />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#181818] h-[40px] w-px" />
            <div className="flex gap-[8px] items-center">
              <div className="relative size-[32px]">
                <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[24px] top-1/2">
                  <img alt="" className="absolute block max-w-none size-full" src={imgLogo} />
                </div>
              </div>
              <p
                className="font-medium leading-[1.2] text-[#f7f7f7] text-[14px] w-[125px]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                adidas Foundation
              </p>
            </div>
            <div className="bg-[#181818] h-[40px] w-px" />
          </div>

          {/* Center: nav tabs */}
          <div className="absolute -translate-x-1/2 flex gap-[24px] items-center" style={{ left: "calc(50% - 173px)", top: 0 }}>
            {[
              { label: "Overview", active: false },
              { label: "Content", active: true },
              { label: "Library", active: false },
              { label: "Media", active: false },
            ].map(({ label, active }) => (
              <div key={label} className="flex items-center h-[40px] pl-[8px] pr-[16px] py-[8px] rounded-[12px]">
                <p
                  className="leading-none text-[12px] uppercase whitespace-nowrap"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1",
                    fontWeight: active ? 500 : 400,
                    color: active ? "#f7f7f7" : "#727272",
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Right: status + icons + avatar */}
          <div className="absolute flex gap-[24px] items-center right-0 top-0">
            <div className="bg-[#181818] h-[40px] w-px" />
            <StagingBadge />
            <LoadingIcon className="relative size-[24px]" />
            <SettingsIcon className="relative size-[24px]" />
            <div className="relative size-[24px]">
              <div className="absolute left-0 rounded-[100px] size-[24px] top-0">
                <img
                  alt="User"
                  className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[100px] size-full"
                  src={imgUserpfp}
                />
              </div>
              <div className="absolute right-0 size-[5px] top-0">
                <img alt="" className="absolute block max-w-none size-full" src={imgEllipse55} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar bar (below top nav, above canvas) ─────────────── */}
      <div
        className="absolute bg-black border-[#181818] border-b border-solid flex items-start px-[16px] py-[8px]"
        style={{ left: 240, top: 105, right: 0, zIndex: 20 }}
      >
        <div className="relative h-[34px] w-full">
          {/* Left: breadcrumb */}
          <div className="absolute flex items-center h-[34px] left-0 top-0">
            <div className="flex gap-[8px] items-center">
              <p
                className="font-normal leading-none text-[#727272] text-[12px] whitespace-pre"
                style={{ fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" }}
              >
                {"PAGES  /"}
              </p>
              <div className="bg-black flex items-center gap-[0] px-[8px] py-[2px] rounded-[8px]">
                <p
                  className="font-normal leading-none text-[#d2d2d2] text-[12px] whitespace-nowrap"
                  style={{ fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" }}
                >
                  Home
                </p>
                <div className="flex items-center justify-center size-[20px]">
                  <div className="-rotate-90 -scale-y-100">
                    <div className="relative size-[20px]">
                      <img alt="" className="absolute block max-w-none size-full" src={imgIconexLightDown2} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center: editing tools */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 flex gap-[12px] items-center"
            style={{ left: "calc(50% - 115.5px)", top: "calc(50% + 0.14px)" }}
          >
            {/* Add */}
            <div className="overflow-clip relative size-[14px]">
              <div className="absolute inset-[3.57%]">
                <div className="absolute inset-[-3.85%]">
                  <img alt="Add" className="block max-w-none size-full" src={imgAdd} />
                </div>
              </div>
            </div>
            <div className="flex items-center overflow-clip px-[4px]">
              <div className="h-[22.286px] relative w-0">
                <div className="absolute inset-[0_-0.5px]">
                  <img alt="" className="block max-w-none size-full" src={imgDivider} />
                </div>
              </div>
            </div>
            {/* Move up */}
            <div className="overflow-clip relative size-[14px]">
              <div className="absolute bottom-[3.57%] left-1/4 right-1/4 top-[3.57%]">
                <div className="absolute inset-[-3.85%_-7.14%]">
                  <img alt="Move up" className="block max-w-none size-full" src={imgArrowUp} />
                </div>
              </div>
            </div>
            {/* Move down */}
            <div className="flex items-center justify-center">
              <div className="-scale-y-100">
                <div className="overflow-clip relative size-[14px]">
                  <div className="absolute bottom-[3.57%] left-1/4 right-1/4 top-[3.57%]">
                    <div className="absolute inset-[-3.85%_-7.14%]">
                      <img alt="Move down" className="block max-w-none size-full" src={imgArrowUp} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center overflow-clip px-[4px]">
              <div className="h-[22.286px] relative w-0">
                <div className="absolute inset-[0_-0.5px]">
                  <img alt="" className="block max-w-none size-full" src={imgDivider} />
                </div>
              </div>
            </div>
            {/* Delete */}
            <div className="overflow-clip relative size-[14px]">
              <div className="absolute inset-[3.57%_7.14%]">
                <div className="absolute inset-[-3.85%_-4.17%]">
                  <img alt="Delete" className="block max-w-none size-full" src={imgTrash} />
                </div>
              </div>
            </div>
            <div className="flex items-center overflow-clip px-[4px]">
              <div className="h-[22.286px] relative w-0">
                <div className="absolute inset-[0_-0.5px]">
                  <img alt="" className="block max-w-none size-full" src={imgDivider} />
                </div>
              </div>
            </div>
            {/* Undo */}
            <div className="overflow-clip relative size-[14px]">
              <div className="absolute inset-[3.57%_12.5%]">
                <div className="absolute inset-[-3.85%_-4.76%]">
                  <img alt="Undo" className="block max-w-none size-full" src={imgUndo} />
                </div>
              </div>
            </div>
            {/* Redo */}
            <div className="overflow-clip relative size-[14px]">
              <div className="absolute inset-[3.57%_12.5%]">
                <div className="absolute inset-[-3.85%_-4.76%]">
                  <img alt="Redo" className="block max-w-none size-full" src={imgRedo} />
                </div>
              </div>
            </div>
            <div className="flex items-center overflow-clip px-[4px]">
              <div className="h-[22.286px] relative w-0">
                <div className="absolute inset-[0_-0.5px]">
                  <img alt="" className="block max-w-none size-full" src={imgDivider} />
                </div>
              </div>
            </div>
            {/* Eye / preview */}
            <div className="overflow-clip relative size-[14px]">
              <div className="absolute inset-[17.86%_3.66%]">
                <div className="absolute inset-[-5.56%_-3.85%]">
                  <img alt="Preview" className="block max-w-none size-full" src={imgEye} />
                </div>
              </div>
            </div>
            <div className="flex items-center overflow-clip px-[4px]">
              <div className="h-[22.286px] relative w-0">
                <div className="absolute inset-[0_-0.5px]">
                  <img alt="" className="block max-w-none size-full" src={imgDivider} />
                </div>
              </div>
            </div>
            {/* Device views */}
            <div className="overflow-clip relative size-[14px]">
              <div className="absolute h-[10.747px] left-0 top-[1.63px] w-[14px]">
                <img alt="Desktop" className="absolute block max-w-none size-full" src={imgLaptop} />
              </div>
            </div>
            <div className="overflow-clip relative size-[14px]">
              <div className="absolute h-[12px] left-[2px] top-px w-[10.002px]">
                <img alt="Mobile" className="absolute block max-w-none size-full" src={imgPhone} />
              </div>
            </div>
            <div className="overflow-clip relative size-[14px]">
              <div className="absolute h-[12px] left-[3px] top-px w-[8.364px]">
                <img alt="Small mobile" className="absolute block max-w-none size-full" src={imgPhoneSmall} />
              </div>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="absolute flex gap-[16px] items-center right-0 top-0">
            <div className="border border-[#181818] border-solid flex items-center justify-center px-[24px] py-[10px] rounded-[100px]">
              <div className="flex items-center justify-center">
                <div className="rotate-180">
                  <div className="overflow-clip relative size-[14px]">
                    <div className="absolute inset-[3.57%]">
                      <div className="absolute inset-[-3.85%]">
                        <img alt="Expand" className="block max-w-none size-full" src={imgExpand} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="border border-[#181818] border-solid flex gap-[8px] items-center justify-center px-[16px] py-[10px] rounded-[100px]">
              <p
                className="font-medium leading-[14px] text-[#f7f7f7] text-[14px] text-center tracking-[-0.28px] whitespace-nowrap"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                EN
              </p>
              <div className="flex items-center justify-center size-[14px]">
                <div className="-rotate-90 -scale-y-100">
                  <div className="relative size-[14px]">
                    <img alt="" className="absolute block max-w-none size-full" src={imgIconexLightDown3} />
                  </div>
                </div>
              </div>
            </div>
            <div className="border border-[#181818] border-solid flex items-center justify-center px-[24px] py-[10px] rounded-[100px]">
              <p
                className="font-medium leading-[14px] text-[#727272] text-[14px] text-center tracking-[-0.28px] whitespace-nowrap"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Save
              </p>
            </div>
            <div className="bg-[#f7f7f7] flex items-center justify-center px-[24px] py-[10px] rounded-[100px]">
              <p
                className="font-medium leading-[14px] text-[#0f0f0f] text-[14px] text-center tracking-[-0.28px] whitespace-nowrap"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Publish
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Canvas preview area ───────────────────────────────────── */}
      <div
        className="absolute border border-[#5314ff] border-solid overflow-clip"
        style={{ left: 256, top: 171, right: 308, bottom: 16 }}
      >
        <div className="absolute inset-[-1px]">
          <img
            alt="Page preview"
            className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
            src={imgClipPathGroup1}
          />
        </div>
      </div>



      {/* ── Right Panel ───────────────────────────────────────────── */}
      <div
        className="absolute bg-black border-[#181818] border-l border-solid flex flex-col items-start overflow-clip p-[16px]"
        style={{ right: 0, top: 155, bottom: 0, width: 292 }}
      >
        {/* Panel header */}
        <div className="flex flex-col items-start w-full">
          <div className="flex flex-col gap-[24px] items-start w-full">
            <div className="flex flex-col items-start py-[16px] w-full">
              <div className="flex gap-[8px] items-center w-full">
                <div className="flex flex-1 items-center min-w-0">
                  <p
                    className="capitalize font-semibold leading-none text-[#727272] text-[14px] whitespace-nowrap"
                    style={{ fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" }}
                  >
                    content
                  </p>
                </div>
                <CollapseIcon open />
              </div>
            </div>

            {/* MEDIA section */}
            <div className="border-[#181818] border-b border-solid flex flex-col items-start pb-[16px] w-full">
              <div className="flex flex-col gap-[8px] items-start w-full">
                {/* Section title + Add button */}
                <div className="flex items-center justify-between w-[260px]">
                  <p
                    className="font-normal leading-none text-[#f7f7f7] text-[14px] uppercase whitespace-nowrap"
                    style={{ fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" }}
                  >
                    media
                  </p>
                  <div className="bg-[#f7f7f7] flex items-center justify-center px-[16px] py-[4px] rounded-[100px]">
                    <p
                      className="font-medium leading-none text-[#181818] text-[12px] text-center tracking-[-0.24px] whitespace-nowrap"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Add
                    </p>
                  </div>
                </div>

                {/* Media cards */}
                <MediaCard />
                <MediaCard />
                <MediaCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
