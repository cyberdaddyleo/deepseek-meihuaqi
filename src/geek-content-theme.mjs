// Verified native hooks: CodeBlock.tsx (.md-code-block / data-code-block-*),
// TerminalBlock.tsx (data-terminal), ToolRow.tsx (data-tool / data-state),
// and DisclosureRow.tsx (data-disclosure-row). No business UI is replaced.
export const geekContentCss = `
html[data-cyber-theme="geek"] [data-slot="main"] .md-code-block {
  --dsl-code-block-background: #06131c;
  --dsl-code-block-banner-background-color: #0d2533;
  --dsl-code-block-border-radius: 6px;
  box-shadow: 0 0 0 1px #36d5ff45, 0 5px 16px #00000026;
}
html[data-cyber-theme="geek"] [data-slot="main"] [data-code-block-banner] {
  font-family: var(--ds-font-family-code);
  box-shadow: inset 0 -1px #36d5ff38, inset 2px 0 #36d5ff85;
}
/* Keep the upstream sticky banner, scrollport, line numbers, wrapping and
   syntax colors intact. In particular, never clip the code block wrapper. */
html[data-cyber-theme="geek"] [data-slot="main"] [data-code-block-content] pre {
  scrollbar-color: #285369 #06131c;
}
html[data-cyber-theme="geek"] [data-slot="main"] [data-terminal] {
  --dsl-terminal-radius: 6px;
  background: #06131c;
  box-shadow: 0 0 0 1px #36d5ff45, 0 5px 16px #00000026;
}
/* Both native containers are already positioned. These 9px marks are purely
   decorative, cannot receive input, and convey no running/error state. */
html[data-cyber-theme="geek"] [data-slot="main"] .md-code-block::after,
html[data-cyber-theme="geek"] [data-slot="main"] [data-terminal]::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 9px;
  height: 1px;
  background: #f75b7266;
  pointer-events: none;
}
html[data-cyber-theme="geek"] [data-slot="main"] [data-tool][data-state] {
  border-radius: 6px;
  background: linear-gradient(100deg, #0b233178, #06131c38);
  box-shadow: inset 2px 0 #36d5ff40;
}
html[data-cyber-theme="geek"] [data-slot="main"] [data-tool] [data-disclosure-row] {
  padding-inline: 8px;
  border-radius: 4px;
}
html[data-cyber-theme="geek"] [data-slot="main"] [data-tool] [data-disclosure-row][data-expandable]:hover {
  background: #36d5ff0d;
}
html[data-cyber-theme="geek"] [data-slot="main"] [data-tool] [data-disclosure-row][data-expandable]:focus-visible {
  outline: 1px solid var(--dsw-focus-ring-color);
  outline-offset: 2px;
}
`;
