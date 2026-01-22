# Mathnotes

A static site for my math notes. Live at [lacunary.org](https://lacunary.org).

## What's here

I write notes in a customized markdown that supports structured mathematical content—definitions, theorems, proofs, lemmas, and so on. These get labeled and can be cross-referenced throughout the site:

```markdown
:::definition @integers "The Integers"
The integers $\mathbb{Z}$ are the set $\{..., -2, -1, 0, 1, 2, ...\}$.
:::

Later, we can reference @integers or even embed the whole block with @@integers.
```

There are also interactive demos (p5.js and Plotly) that help visualize how things work—phase portraits, vector fields, that sort of thing.

## Running it

```bash
# dev
docker-compose -f docker-compose.dev.yml up

# prod (generates static HTML, serves with nginx)
docker-compose up --build
```

## License

All content and code are the property of Jason Hobbs. All rights reserved.
