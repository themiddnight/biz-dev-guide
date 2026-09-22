# Task 5 browser evidence (overwrite each session)

Dev server: http://localhost:53479 (reused, port matched). Fresh profile via
`localStorage.clear(); location.hash=''; location.reload()` at start. Navigation done via
Index drawer clicks (hash-route `#/ch/N` set via JS does not trigger in-app navigation —
listener only reacts to user-driven route pushes, not external `location.hash =` writes).

## Task 5 brief checks
1. ch.11 FAQ renders; opened Q1 (no playbook link) then opened all Qs, found
   "ดู playbook เต็ม: บทที่ 6/8/1/2" links. Clicked "บทที่ 6" link →
   `#friction-playbook-card` rect.top settled at **128px** (within 0–200). PASS
2. ch.11 FAQ concept chip "requirements volatility" (under Q1) clicked → app
   navigated to ch.15/15, glossary search input value = **"requirements volatility"**. PASS
3. ch.15 glossary: typed "API" → "แสดง 0 จาก 99 คำ"; cleared → "แสดง 99 จาก 99 คำ";
   clicked category chip "Requirements (14)" → "แสดง 14 จาก 99 คำ". Query and
   category filters both change results. PASS
4. ch.1 Reference section renders: "เนื้อหาอ้างอิง (Reference) ... (3 รายการ)".
   ch.3: `find` "เนื้อหาอ้างอิง (Reference)" → no matches. PASS
5. ch.1 Examples ("กรณีศึกษาจริงในอุตสาหกรรม") and Core Concepts
   ("ความรู้เชิงลึกและหลักการสำคัญ") both toggle open/closed — verified via
   innerHTML length change (Core Concepts: 4345 open → 1019 closed → 4345 open)
   and text presence (Examples: "บริบทและโจทย์เริ่มต้น" true→false→true). PASS

## Task 4 carry-over checks
a. ch.5: selected C4 level L3 ("Level 3: Component Diagram" text shown, L3
   `aria-pressed=true`). Collapsed the diagram section (toggle button) → L3
   button not in DOM/hidden (`offsetParent === null`). Re-expanded → L3 button
   visible again with `aria-pressed="true"`. Level selection persisted. PASS
b. ch.5: clicked diagram-family grid jump button "พฤติกรรม..." (behavior) →
   `#s5-swimlane-vs-sequence` rect.top settled at **128px** after ~1.3s. PASS
c. ch.15: clicked GlossaryCategoryMap tile "Architecture & diagrams (11)"
   (inside the diagram section, chapter.id === 's15' branch) → glossary panel
   results changed to "แสดง 11 จาก 99 คำ", matching the tile's count. PASS

## Console
`read_console_messages({onlyErrors: true})` → "No console logs." (empty, as required).

## Notable finding (see report)
Task 4's commit (c7a495d) had deleted the FAQ (`SECTION 4.4`) and Examples
(`SECTION 4.5`) blocks from `GuideTab.tsx` entirely — they were present in base
commit `06df5e5` and every commit through `5b5a41a`, but missing from `c7a495d`
onward (confirmed via `git show <rev>:GuideTab.tsx | grep 'SECTION 4.4'`). This
task restored them (from `06df5e5`) into `FaqSection.tsx` / `ExamplesSection.tsx`
and wired them back into `GuideTab.tsx`, since Task 5's brief explicitly names
these as extraction sources.
