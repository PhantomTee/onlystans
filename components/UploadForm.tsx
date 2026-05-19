"use client";

import { useMemo, useState } from "react";
import { BadgeDollarSign, CheckCircle2, CloudUpload, Sparkles, X } from "lucide-react";
import { estimatedMonthly, usd } from "@/lib/utils";

const PRESETS = [
  { key: "micro",    label: "Micro",    rate: 0.000001, desc: "Max reach, tiny cost" },
  { key: "low",      label: "Low",      rate: 0.00001,  desc: "Casual viewers"      },
  { key: "standard", label: "Standard", rate: 0.0001,   desc: "Most popular"        },
  { key: "premium",  label: "Premium",  rate: 0.001,    desc: "Dedicated fans"      },
];

type UploadStatus = "idle" | "tagging" | "uploading" | "registering" | "done" | "error";

export function UploadForm() {
  const [file,        setFile]        = useState<File | null>(null);
  const [dragOver,    setDragOver]    = useState(false);
  const [rate,        setRate]        = useState(0.0001);
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [tags,        setTags]        = useState("");
  const [subRate,     setSubRate]     = useState("");
  const [status,      setStatus]      = useState<UploadStatus>("idle");
  const [statusMsg,   setStatusMsg]   = useState("");
  const [txHash,      setTxHash]      = useState("");
  const monthly = useMemo(() => estimatedMonthly(rate), [rate]);

  async function onFile(nextFile: File | null) {
    if (!nextFile) return;
    if (nextFile.size > 100 * 1024 * 1024) { setStatusMsg("Max file size is 100 MB."); return; }
    setFile(nextFile);
    setStatus("tagging");
    setStatusMsg("Auto-tagging with AI…");
    const tag = await fetch("/api/agent/tag", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: nextFile.name }),
    }).then((r) => r.json());
    setTitle(tag.title);
    setDescription(tag.description);
    setTags(tag.tags.join(", "));
    setStatus("idle");
    setStatusMsg("");
  }

  async function publish() {
    if (!file) return;
    setStatus("uploading"); setStatusMsg("Uploading to IPFS…");
    const form = new FormData();
    form.append("file", file);
    const upload = await fetch("/api/upload", { method: "POST", body: form }).then((r) => r.json());

    setStatus("registering"); setStatusMsg("Registering on ContentRegistry…");
    const registered = await fetch("/api/videos", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, description,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        ratePerSecond: rate,
        subscriptionRate: subRate ? Number(subRate) : undefined,
        videoCid: upload.cid, thumbnailCid: "first-frame", src: upload.src,
      }),
    }).then((r) => r.json());

    setTxHash(registered.txHash);
    setStatus("done");
    setStatusMsg("");
  }

  const progress =
    status === "tagging"     ? 20  :
    status === "uploading"   ? 55  :
    status === "registering" ? 85  :
    status === "done"        ? 100 : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal-400">Creator Studio</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Upload &amp; Publish</h1>
        <p className="mt-2 text-zinc-500">MP4 → IPFS → ContentRegistry in one flow. AI tags your clip automatically.</p>
      </div>

      {/* Drop zone */}
      <label
        onDrop={(e) => { e.preventDefault(); setDragOver(false); onFile(e.dataTransfer.files[0]); }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`flex aspect-video cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-all ${
          file
            ? "border-teal-400/50 bg-teal-400/[0.04]"
            : dragOver
            ? "border-violet-400/60 bg-violet-400/[0.05] scale-[1.01]"
            : "border-white/[0.10] bg-white/[0.02] hover:border-white/20"
        }`}
      >
        {file ? (
          <div className="flex items-center gap-3 text-center">
            <CheckCircle2 className="h-8 w-8 text-teal-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">{file.name}</p>
              <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
            <button onClick={(e) => { e.preventDefault(); setFile(null); setStatus("idle"); }}
              className="text-zinc-600 hover:text-zinc-300">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <CloudUpload className={`h-10 w-10 ${dragOver ? "text-violet-400" : "text-zinc-600"}`} />
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-300">Drop an MP4 or click to choose</p>
              <p className="text-xs text-zinc-600">Max 100 MB</p>
            </div>
          </>
        )}
        <input type="file" accept="video/mp4" className="hidden" onChange={(e) => onFile(e.target.files?.[0] || null)} />
      </label>

      {/* Metadata */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Metadata</p>
        <div className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none ring-teal-400/25 transition focus:ring-2" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (auto-generated)" rows={3}
            className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none ring-teal-400/25 transition focus:ring-2" />
          <div className="relative">
            <Sparkles className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-teal-500/60" />
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tags, auto-generated"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-9 pr-4 text-sm text-white placeholder-zinc-600 outline-none ring-teal-400/25 transition focus:ring-2" />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <BadgeDollarSign className="h-4 w-4 text-teal-400" />
          <p className="text-sm font-semibold text-zinc-300">Pricing</p>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRESETS.map((p) => (
            <button key={p.key} onClick={() => setRate(p.rate)}
              className={`rounded-xl border p-3 text-left transition ${
                rate === p.rate
                  ? "border-teal-400/50 bg-teal-400/10 text-teal-300"
                  : "border-white/[0.07] bg-white/[0.03] text-zinc-400 hover:border-white/15 hover:bg-white/[0.05]"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wider">{p.label}</p>
              <p className="mt-0.5 font-mono text-xs">{p.rate.toFixed(6)}/s</p>
              <p className="mt-0.5 text-[10px] text-zinc-600">{p.desc}</p>
            </button>
          ))}
        </div>

        <input type="range" min="0.000001" max="0.001" step="0.000001" value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          className="w-full accent-teal-400" />

        <div className="grid grid-cols-3 gap-2 font-mono text-xs text-zinc-500">
          <span className="text-teal-300">{rate.toFixed(6)}/s</span>
          <span>{usd(rate * 60, 6)}/min</span>
          <span>{usd(rate * 3600, 4)}/hr</span>
        </div>
        <p className="text-xs text-zinc-600">
          Est. with 1,000 viewers × 5 min/day: <span className="text-zinc-400">{usd(monthly, 2)}/month</span>
        </p>

        {/* Subscription bundle */}
        <div className="border-t border-white/[0.06] pt-4">
          <p className="mb-2 text-xs text-zinc-600">Optional: flat monthly subscription rate (USDC)</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">$</span>
            <input value={subRate} onChange={(e) => setSubRate(e.target.value)} placeholder="e.g. 4.99"
              className="w-32 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none ring-violet-400/25 transition focus:ring-2" />
            <span className="text-xs text-zinc-600">/month — shown as an option alongside per-second</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      {progress > 0 && (
        <div className="space-y-1.5">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full bg-gradient-to-r from-teal-500 to-teal-300 transition-all duration-700 origin-left"
              style={{ width: `${progress}%` }} />
          </div>
          {statusMsg && <p className="text-xs text-zinc-500">{statusMsg}</p>}
        </div>
      )}

      {/* CTA */}
      <button onClick={publish} disabled={!file || status === "uploading" || status === "registering"}
        className="w-full rounded-xl bg-white py-3 text-sm font-bold text-zinc-950 shadow-xl shadow-black/20 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]">
        {status === "uploading" || status === "registering" ? "Publishing…" : "Publish to ContentRegistry"}
      </button>

      {status === "done" && txHash && (
        <div className="rounded-xl border border-teal-400/20 bg-teal-400/[0.06] p-4 animate-slide-up">
          <p className="text-sm font-semibold text-teal-300">Published successfully ✓</p>
          <p className="mt-1 break-all font-mono text-xs text-zinc-500">{txHash}</p>
        </div>
      )}
    </div>
  );
}
