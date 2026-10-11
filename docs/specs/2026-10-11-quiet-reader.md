# Quiet chapter reader

Date: 2026-10-11. Status: approved in chat by the owner, after a prototype of chapter 16.

## Goal

The chapter reader shows a lot of frame around its content: a card for each section, a card for each item inside it, a coloured box for most warnings, an emoji and an English name in each section header, and three control bars above the first section. The owner compared a prototype without these against the current reader and chose the prototype. This spec applies that style to all 19 chapters and removes the old one.

The prototype is `src/proto/QuietChapter.tsx` on the branch `proto/quiet-chapter`. It is the visual reference. It is not the code to ship: it draws only the sections chapter 16 has, and it drops several behaviours listed under "Behaviour that stays".

## Visual rules

1. A section is a heading on a hairline rule. It is not a card.
2. Items inside a section are rows or lists, divided by hairlines. They are not cards.
3. A frame is kept for content of a different kind: the hero figure, an interactive diagram widget, a table, and the friction playbook.
4. Red and green mark the wrong-way and right-way dialogue. Elsewhere a status colour is used on one label word at most, never on a box.
5. Section headings carry no emoji and no English name in parentheses: `แนวคิดหลัก`, not `💡 แนวคิดหลัก (Core Concepts)`.
6. Body text is 15px with a line height of 28px. Section headings are 20px. Labels and meta text are 14px. Prose is at most 44rem wide.
7. Every colour comes from the existing design tokens. Light and dark themes both work.

## Structure of a chapter page

In reading order:

1. One meta line: chapter number, which side owns the work, reading time, and the read mark.
2. Title, English name, subtitle, and the chapter opening line.
3. Hero figure with its caption, the seat line with its flip control, and the analogy. Chapters without a hero figure show the analogy as a plain paragraph.
4. Key takeaway.
5. The primer as one paragraph.
6. The control row.
7. The sections, in the order the layout gives for the reader's level.

No text is removed. The prototype hid the chapter opening and the primer scenario; the shipped reader keeps both, because the opening line defines the abbreviations a chapter uses.

## Control row

One sticky row under the app header replaces the level banner, its hint box, the section outline and the layer headers.

- Left: a link to each section, grouped by a muted layer label (`ต้องรู้`, `นำไปใช้`, `เจาะลึก`). A link scrolls to its section and opens the section if it is folded. On a narrow screen the links scroll sideways on one line.
- Right: the level switch (`มือใหม่`, `คุ้นงานแล้ว`). It keeps today's behaviour: with no role it sets the base level, with a role it sets a level for this chapter only.
- When a level is set for this chapter only, the row shows the reset control that returns the chapter to its default.
- From the `sm` breakpoint up, the row also has one control that opens or folds every section.
- The row publishes its height as `--outline-h`, so anchor targets stop below it.

## Folding

Sections in the reader's Core layer are open and have no fold control. Sections in the other layers start folded, and their heading is the fold control (a button with `aria-expanded`). Fold state lives in `OpenState.sections` as today, so a route such as `#/ch/16/pitfalls` and a link in the control row can open a section.

Layers are no longer foldable groups. `OpenState.layers`, `toggleLayer`, `LayerGroup`, `lensHint` and `SectionOutline` are deleted with their tests.

## Definition dropdowns in more sections

Automatic term marking now also covers the examples, practice, pitfalls and friction sections, the formal definition in the jargon list, and the seat line under the hero figure. The rule is unchanged: a term is marked at its first use in each section, and headings are never marked. Each new walk is a pure function in `src/lib/sectionTerms.ts`, like the existing ones, and the track guard in `src/data/termCoverage.test.ts` reads them.

Tables, notes and reference cards (`ContentBlocks`) stay unmarked.

## Behaviour that stays

- Routes and aliases: `#/ch/N`, `#/ch/N/<section>`, and the retired section names.
- The read mark, bookmark, previous and next chapter, the track footer, and the Ask AI button.
- The seat flip under the hero figure.
- Checklist ticks, saved as today.
- The other-side switch with its three views.
- The beginner view of core concepts: heading and detail first, bullets behind a control.
- Every diagram widget, the C4 explorer, the glossary panel and its category map, the FAQ with its quick-jump chips, and the friction dilemma.
- Chapter search, which matches the same fields as today.
- The 44px tap target on every control at phone width.

## Out of scope

- The landing card, the chapter index, the role mindset card, the AI tab and the quiz tab.
- The content of any chapter.
- New glossary entries.
