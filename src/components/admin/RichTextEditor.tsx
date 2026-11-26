"use client";

import { useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Code, Heading2, Heading3, ImageIcon, Italic, Link2, List, ListOrdered, Minus, Quote, Redo2, Strikethrough, Undo2 } from "lucide-react";

function ToolbarButton({ onClick, active, label, children, disabled }: { onClick: () => void; active?: boolean; label: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-md text-slate transition-colors disabled:opacity-40 ${active ? "bg-ink text-white" : "hover:bg-paper hover:text-ink"}`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (leave empty to remove)", previous ?? "https://");
    if (url === null) return;
    if (url === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else if (/^(https?:\/\/|\/|mailto:|tel:)/i.test(url)) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp,image/avif,image/gif";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.url) {
        const alt = window.prompt("Describe the image for screen readers (alt text)", "") ?? "";
        editor.chain().focus().setImage({ src: data.url, alt }).run();
      } else window.alert(data.message ?? "Upload failed.");
    };
    input.click();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-[#fbfbfc] px-2 py-1.5">
      <ToolbarButton label="Heading" active={state.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></ToolbarButton>
      <ToolbarButton label="Subheading" active={state.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={16} /></ToolbarButton>
      <span className="mx-1 h-5 w-px bg-line" />
      <ToolbarButton label="Bold" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></ToolbarButton>
      <ToolbarButton label="Italic" active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></ToolbarButton>
      <ToolbarButton label="Strikethrough" active={state.strike} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={16} /></ToolbarButton>
      <ToolbarButton label="Inline code" active={state.code} onClick={() => editor.chain().focus().toggleCode().run()}><Code size={16} /></ToolbarButton>
      <span className="mx-1 h-5 w-px bg-line" />
      <ToolbarButton label="Bulleted list" active={state.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></ToolbarButton>
      <ToolbarButton label="Numbered list" active={state.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></ToolbarButton>
      <ToolbarButton label="Quote" active={state.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={16} /></ToolbarButton>
      <ToolbarButton label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={16} /></ToolbarButton>
      <span className="mx-1 h-5 w-px bg-line" />
      <ToolbarButton label="Link" active={state.link} onClick={setLink}><Link2 size={16} /></ToolbarButton>
      <ToolbarButton label="Insert image" onClick={addImage}><ImageIcon size={16} /></ToolbarButton>
      <span className="ml-auto" />
      <ToolbarButton label="Undo" disabled={!state.canUndo} onClick={() => editor.chain().focus().undo().run()}><Undo2 size={16} /></ToolbarButton>
      <ToolbarButton label="Redo" disabled={!state.canRedo} onClick={() => editor.chain().focus().redo().run()}><Redo2 size={16} /></ToolbarButton>
    </div>
  );
}

/** Rich text editor that submits its HTML through a hidden input named `name`. */
export function RichTextEditor({ name, label, defaultValue = "", placeholder = "Start writing…", minHeight = 320, onChange }: { name?: string; label: string; defaultValue?: string; placeholder?: string; minHeight?: number; onChange?: (html: string) => void }) {
  const [html, setHtml] = useState(defaultValue);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true, protocols: ["http", "https", "mailto", "tel"] } }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: { class: "prose-alfa !max-w-none px-4 py-4 focus:outline-none", style: `min-height:${minHeight}px`, "aria-label": label },
    },
    onUpdate: ({ editor: e }) => {
      const next = e.isEmpty ? "" : e.getHTML();
      setHtml(next);
      onChange?.(next);
    },
  });

  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="overflow-hidden rounded-lg border border-line-strong bg-white focus-within:border-ink">
        {editor ? <Toolbar editor={editor} /> : <div className="h-11 border-b border-line bg-[#fbfbfc]" />}
        <EditorContent editor={editor} />
      </div>
      {name ? <input type="hidden" name={name} value={html} /> : null}
    </div>
  );
}
