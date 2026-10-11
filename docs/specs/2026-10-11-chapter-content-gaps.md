# Chapter content gaps

Date: 2026-10-11. Status: approved in chat by the owner.

An inventory of all 19 chapters found seven gaps. This spec records the decision for each.

## A. Direct fixes

| ID | Gap | Decision |
|----|-----|----------|
| A1 | `commonPitfalls[].symptom` is written for all 76 pitfalls and never rendered. | `PitfallsSection` shows three lines per card: pitfall, warning sign (`อาการเตือน`), solution. The symptom line is omitted when a pitfall has no symptom. |
| A2 | s1 keeps `diagramTitle` and `diagramDescription`, but s1 has no Diagram section. | Delete both fields from s1. |
| A3 | `Chapter.contentHtml` is declared and never used. | Delete the field from the type. |

## B. Friction playbooks

| ID | Decision |
|----|----------|
| B1 | Move the "Blame vs Blameless" playbook from s12 to s10. The text does not change. s10 is the incident chapter, so the playbook matches its topic there. |
| B2 | Write new playbooks for s12, s16, s17, s18 and s19. Each has both frustrations, the root cause, one trade-off row and one golden script. None has a `dilemma`. |

Topics:

- s12: build now while the problem is unclear, or take time to find the answer first.
- s16: a small refund bug that leaks money on every order, against the engineering backlog order.
- s17: a launch date that cannot move, against work that is not finished.
- s18: a "small" extra request, and the work it displaces.
- s19: a promise the sales team already made to a customer, against team capacity.

After this change, the chapters with a playbook are s1, s2, s4, s6, s7, s8, s10, s11, s12, s16, s17, s18 and s19.

## C. Hero figures for s16-s19

This reverses decision P4.1 of the role-perspective spec, which kept s16-s19 without a hero figure. The owner chose to add them so that every chapter opens with a figure.

Each figure continues the refund story of chapters 1-15, and has a caption and one line for each seat.

| Chapter | Figure key | Content |
|---------|-----------|---------|
| s16 | `refund-unit-economics` | Order #A1024 from sale price to profit, and the part the refund bug removes. |
| s17 | `refund-fixed-deadline` | A campaign calendar with a date that cannot move, and the refund scope that is cut to meet it. |
| s18 | `refund-opportunity-cost` | A Sprint board: a "small" refund request enters and another item leaves. |
| s19 | `refund-sla-penalty` | The refund SLA clause in a contract, the actual time, and the penalty. |

With a hero figure, `plainAnalogy` renders as one line under the figure and must fit the existing 80-character budget. Money uses ฿, never $.

## D. Reading tracks and quiz

| ID | Decision |
|----|----------|
| D1 | The Business track becomes 2, 1, 14, 4, 5, 6, 8, 9, 10, 11. Its length grows from 94 to 120 minutes. The owner accepted the longer track. s15 stays outside every track because it is a reference chapter. |
| D2 | Add one quiz question each for s1, s3, s12, s14 and s15. The bank grows from 20 to 25 questions and every chapter has at least one. |

## E. Terms in parentheses get a definition dropdown

Added on 2026-10-11 after a check of first-use terms. It refines guardrail 6 of the term-definitions spec (P3.5).

Before, automatic marking skipped a term that stood alone in parentheses, such as `เงินที่ได้จากลูกค้าหนึ่งคน (LTV)`, and counted it as defined for the rest of the section. CAC and LTV in s16 had no dropdown anywhere.

| Text | Result |
|------|--------|
| `รายได้ (Revenue)`, `... (LTV)` | The term in parentheses is marked. |
| `Product Manager (PM)`, `Key Results (KR)` | The short form in parentheses is marked. |
| `QA (Quality Assurance)`, `KR (ผลลัพธ์หลัก)` | No change. The parentheses spell the term out, so nothing is marked. |

A term is still marked once in each section. The change adds 21 markers across the 19 chapters and removes none.

## Out of scope

- Interactive diagram widgets for s16-s19.
- Reference content blocks for s17-s19.
