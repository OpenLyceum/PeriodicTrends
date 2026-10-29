# Implementation notes

## Layout

- **Trends** (1024 × 618 layout bounds): the table across the top left, 36 × 40 px cells with a
  16 px header row / column of group and period numbers. The empty slots of periods 1–3, groups
  3–12 hold the anchor element's card and the colour key (`PeriodicTableNode.spanBounds`). The
  graph sits below (560 × 300 px), the property panel and "Why?" panel in a 290 px right column.
  Every element's cell (all 86) is built once and hidden beyond the table extent, so changing the
  preference rebuilds nothing. A larger table (and the card and colour key with it) is scaled to
  at most 250 px tall, and the graph takes the height left under it (`TrendChartNode.setChartHeight`).
- **Shielding**: element picker (22 px cells; hidden cells excluded from its bounds) top left, the
  atom below it, scaled (up to 1.2) to fill the space the picker leaves; beyond krypton its up to
  ten rings are spread evenly and crowded rings draw smaller electrons, Slater's
  rules and the effective-charge bars in a 280 px middle column, the electron choice and colour
  key in a 200 px right column.

## Shared state

`SelectedElementModel` is constructed once in `main.ts` and passed to both screen models.
`TrendsModel.select()` writes the selection's anchor into it; the Shielding screen derives its
element from it and resets the chosen electron to the outermost one on every change. The
"Explain with shielding" button switches screens through a callback that `main.ts` closes over
`sim.selectedScreenProperty`.

## Selections

`TrendSelection` is `{ kind, zs, anchorZ }`, compared by value (`selectionsEqual`) so dragging
over the same run does not re-notify. A drag (or a Shift+arrow extension) snaps to the axis with
more movement: more columns → period run, otherwise group run. Runs are always ordered by
increasing Z, so the explanation can say "across" and "down" without tracking direction. A run
that contains one element becomes a single selection (e.g. group 5 is just V).

A single selection plots every element on the table against Z (the classic sawtooth) with the
element ringed, rather than a lone point. With more than 40 points only the noble gases and the
chosen element are labelled.

Selections are made against the current `TableExtent` (grid cells are `{ row, column }`). When
the table shrinks, a selection that no longer fits is replaced by period 2, and the shared element
by the default if it is off the table.

## Rebuild-and-dispose views

The graph, the explanation and the atom rebuild their children on every relevant change and
dispose the old nodes first, because they hold links to `ProfileColorProperty` fills. They depend
on `localeProperty` as well as the model so the text follows a language switch.

## Colours

Cell fills blend `heatLow` and `heatHigh` (`Color.interpolateRGBA`) at runtime; the cell text
switches between `cellTextDark` and `cellTextLight` by the fill's WCAG luminance. The table
re-colours on profile change because the heat colours are in its Multilink. No colour literal
lives outside `PeriodicTrendsColors.ts`.

## Text

Visible explanations are RichText markup (`Z<sub>eff</sub>`); spoken text goes through
`toPlainText` or uses separate a11y strings that say "effective nuclear charge". All templates
use `StringUtils.fillIn` with `{{placeholders}}`. Element names are in the strings files keyed by
symbol, so they translate.
