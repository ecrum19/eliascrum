# RDF Transition Plan

This plan keeps the current TypeScript data model intact while introducing RDF incrementally.

## Phase 1: Parallel RDF Mirror (Current)

1. Keep existing `src/data/*.ts` as source of truth for UI.
2. Generate RDF mirror into `src/data/rdf/site-data.ttl`:
   - Command: `npm run rdf:export`
3. Maintain SHACL constraints in `src/data/rdf/site-shapes.ttl`.
4. Allow additive RDF edits via SPARQL Update:
   - Command: `npm run rdf:update -- --update src/data/rdf/updates/<file>.ru`

## Phase 2: Validation in CI

1. Add SHACL validation job (e.g., pySHACL or Jena) on `site-data.ttl`.
2. Fail CI on shape violations (required fields, missing links, bad datatypes).
3. Add a weekly check for drift between TS source and RDF mirror.

## Phase 3: Read Path Migration

1. Move one read path at a time from TS objects to RDF queries:
   - Talks/posters first
   - Publications second
   - Homepage updates third
2. Keep TS fallback until each page is validated against RDF output.

## Phase 4: RDF as Primary Storage

1. Capture new entries directly as RDF updates (+ optional form tooling).
2. Optionally generate TS compatibility snapshots from RDF for legacy components.
3. Retire duplicated TS data files once all consumers read from RDF.

## Operational Rules

- Regenerate RDF after TS changes: `npm run rdf:export`
- Apply hand-authored RDF updates with `rdf:update`.
- Validate against SHACL before deployment.
- Prefer stable IDs (`publication/{id}`, `talk/{slug}`, `blog-post/{id}`) for all joins.
