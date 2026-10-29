/**
 * Memory-leak regression suite (fleet standard).
 *
 * List every model/view object that links Properties, adds listeners, or owns child
 * nodes, with a factory that builds a fresh instance. The shared harness in
 * tests/helpers/memoryLeak.ts (template-owned) checks that each one is garbage
 * collected after dispose() and leaves no survivors across repeated cycles
 * (idempotentDispose: true also checks a second dispose()). Add sim-specific leak
 * tests below using forceGC().
 *
 * The graph, the explanation and the atom rebuild their children on every change and
 * dispose the old ones; AnomalyBadge is the one node created per rebuild that is not
 * plain Text or Circle, so it is listed here.
 */

import { AnomalyBadge } from "../src/trends/view/AnomalyBadge.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

describeDisposalLeaks([{ name: "AnomalyBadge", create: () => new AnomalyBadge(1), idempotentDispose: true }]);
