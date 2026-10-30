"use client";
import { useState } from "react";
import { type Bot, sourceUrl } from "@/lib/bots";
import type { DownloadFile } from "@/lib/files";
import { fmtDate, fmtSize } from "@/lib/format";
import { licenseInfo } from "@/lib/license";
import { More, pill } from "./Button";
import { DownloadButton } from "./DownloadButton";
import { CmdLine, TermFrame } from "./Term";

/** The download section of a bot page: the file's details on the left, how to run it on the right. */
export function GetIt({ bot, file }: { bot: Bot; file: DownloadFile | null }) {
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  const verify = file?.sha256 ? `echo "${file.sha256}  ${file.fileName}" | shasum -a 256 -c` : "";
  const copy = () => {
    navigator.clipboard.writeText(verify).then(() => setCopied("done"), () => setCopied("failed"));
    setTimeout(() => setCopied("idle"), 2200);
  };

  if (!file) {
    return <p className="rounded-ui bg-tile p-8 text-fg-2">The zip for this version isn&apos;t on the server yet. Check back soon, or use the GitHub release.</p>;
  }

  const rows: [string, React.ReactNode][] = [
    ["File", <span key="f" className="t-mono">{file.fileName}</span>],
    ["Version", bot.version],
    ["Size", fmtSize(file.size)],
    ["Last updated", fmtDate(bot.updated)],
    ["Licence", licenseInfo(bot.license).short],
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="flex flex-col rounded-ui bg-tile p-8">
        <h3 className="t-h3">The file</h3>
        <dl className="mt-6 divide-y divide-line/70 border-y border-line/70">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-6 py-3">
              <dt className="t-small font-mono text-fg-3">{k}</dt><dd className="min-w-0 truncate text-right tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        {file.sha256 && (
          <>
            <p className="t-small mt-6 font-mono text-fg-3">SHA-256</p>
            <p className="t-small mt-1 break-all font-mono">{file.sha256}</p>
            <button type="button" onClick={copy} className={pill("secondary", "md", "mt-6 self-start")}>
              {copied === "done" ? "Copied" : copied === "failed" ? "Couldn't copy. Select the checksum above." : "Copy check command"}
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col">
        <TermFrame title="Run it">
          {[{ cmd: `unzip ${file.fileName}` }, { cmd: "cp .env.example .env", note: "add your bot token" }, { cmd: "npm ci && npm start" }].map((l) => <CmdLine key={l.cmd} line={l} />)}
        </TermFrame>
        <p className="t-small mt-4 text-fg-2">Put your Discord bot token in <code className="rounded-ui bg-tile px-1.5 py-0.5 font-mono text-[0.9em]">.env</code> before starting. Each bot&apos;s README lists anything else it needs.</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <DownloadButton slug={bot.slug} size="lg">Download v{bot.version}</DownloadButton>
        </div>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          <More href={sourceUrl(bot)} external>View source</More>
          <More href={bot.download.github.releases} external>Latest release</More>
        </div>
      </div>
    </div>
  );
}
