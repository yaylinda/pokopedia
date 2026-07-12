"use client";

import { useMemo, useState } from "react";
import data from "./litter-data.json";

type Pokemon = (typeof data.roster)[number];
type House = (typeof data.houses)[number];
type View = "houses" | "roster";

const habitatClass = (habitat: string) =>
  `habitat habitat-${habitat.toLowerCase()}`;

function PokemonPortrait({ pokemon, size = "large" }: { pokemon: Pokemon; size?: "small" | "large" }) {
  return (
    <div className={`portrait portrait-${size}`}>
      <img src={pokemon.imageUrl} alt={`${pokemon.name} icon`} loading="lazy" />
      {pokemon.isCurrentAddition ? <span className="new-dot" title="Added from the current Serebii list">New</span> : null}
    </div>
  );
}

function ItemPill({ pokemon }: { pokemon: Pokemon }) {
  return (
    <span className="item-pill">
      <img src={pokemon.litterItem.imageUrl} alt="" loading="lazy" />
      {pokemon.litterItem.name}
    </span>
  );
}

function Resident({ pokemon }: { pokemon: Pokemon }) {
  return (
    <article className="resident">
      <PokemonPortrait pokemon={pokemon} />
      <div className="resident-copy">
        <span className="dex-number">{pokemon.pokopiaNumberDisplay}</span>
        <h3>{pokemon.name}</h3>
        <span className={habitatClass(pokemon.idealHabitat)}>{pokemon.idealHabitat}</span>
      </div>
      <ItemPill pokemon={pokemon} />
    </article>
  );
}

function HouseCard({ house }: { house: House }) {
  return (
    <article className="house-card">
      <header className="house-header">
        <div className="house-number">{String(house.number).padStart(2, "0")}</div>
        <div>
          <div className="eyebrow-row">
            <span>Suggested house</span>
            <span className={`strength strength-${house.strength.toLowerCase().replace(" ", "-")}`}>{house.strength}</span>
          </div>
          <h2>{house.name}</h2>
          <p>{house.subtitle}</p>
        </div>
      </header>

      <div className="residents">
        {house.pokemon.map((pokemon) => (
          <Resident key={pokemon.slug} pokemon={pokemon} />
        ))}
      </div>

      <footer className="house-logic">
        <div className="logic-lead">
          <span className="logic-icon" aria-hidden="true">✦</span>
          <div>
            <span>Why this works</span>
            <strong>{house.primaryReason}</strong>
          </div>
        </div>
        <ul>
          {house.reasons.map((reason) => <li key={reason}>{reason}</li>)}
        </ul>
      </footer>
    </article>
  );
}

function RosterCard({ pokemon }: { pokemon: Pokemon }) {
  return (
    <article className="roster-card">
      <PokemonPortrait pokemon={pokemon} size="small" />
      <div className="roster-name">
        <span>{pokemon.pokopiaNumberDisplay}</span>
        <h3>{pokemon.name}</h3>
      </div>
      <span className={habitatClass(pokemon.idealHabitat)}>{pokemon.idealHabitat}</span>
      <ItemPill pokemon={pokemon} />
      <div className="favorites" aria-label={`Favorite categories for ${pokemon.name}`}>
        {pokemon.favorites.slice(0, 3).map((favorite) => <span key={favorite}>{favorite}</span>)}
        {pokemon.favorites.length > 3 ? <span>+{pokemon.favorites.length - 3}</span> : null}
      </div>
    </article>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("houses");
  const [query, setQuery] = useState("");
  const [habitat, setHabitat] = useState("All habitats");
  const [item, setItem] = useState("All litter items");

  const habitats = [...new Set(data.roster.map((pokemon) => pokemon.idealHabitat))].sort();
  const items = [...new Set(data.roster.map((pokemon) => pokemon.litterItem.name))].sort();

  const matches = (pokemon: Pokemon) => {
    const normalizedQuery = query.trim().toLowerCase();
    const searchable = [pokemon.name, pokemon.idealHabitat, pokemon.litterItem.name, ...pokemon.favorites].join(" ").toLowerCase();
    return (!normalizedQuery || searchable.includes(normalizedQuery))
      && (habitat === "All habitats" || pokemon.idealHabitat === habitat)
      && (item === "All litter items" || pokemon.litterItem.name === item);
  };

  const filteredRoster = useMemo(() => data.roster.filter(matches), [query, habitat, item]);
  const filteredHouses = useMemo(
    () => data.houses
      .map((house) => ({ ...house, pokemon: house.pokemon.filter(matches) }))
      .filter((house) => house.pokemon.length > 0),
    [query, habitat, item],
  );

  const resetFilters = () => {
    setQuery("");
    setHabitat("All habitats");
    setItem("All litter items");
  };

  return (
    <main>
      <section className="hero">
        <nav className="topbar" aria-label="Dashboard navigation">
          <a href="#top" className="brand"><span>POKO</span><strong>HOMES</strong></a>
          <div className="source-note"><span className="source-live" /> Data checked July 11, 2026</div>
        </nav>

        <div className="hero-grid" id="top">
          <div className="hero-copy">
            <p className="kicker">Litter specialty · housing field guide</p>
            <h1>Make every<br /><em>drop</em> feel at home.</h1>
            <p className="dek">Thirteen practical house groupings for every Pokémon that litters—balanced around habitat, favorite things, family ties, and the materials they leave behind.</p>
          </div>
          <div className="hero-art" aria-label="Featured litter Pokémon">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            {["jirachi", "clodsire", "jumpluff", "volcarona"].map((slug, index) => {
              const pokemon = data.roster.find((entry) => entry.slug === slug)!;
              return <div className={`hero-pokemon hero-pokemon-${index + 1}`} key={slug}><img src={pokemon.imageUrl} alt={pokemon.name} /></div>;
            })}
            <div className="hero-stamp"><strong>35</strong><span>residents</span></div>
          </div>
        </div>

        <div className="metrics" aria-label="Dashboard summary">
          <div><strong>{data.roster.length}</strong><span>Litter Pokémon</span></div>
          <div><strong>{data.houses.length}</strong><span>Suggested houses</span></div>
          <div><strong>{items.length}</strong><span>Material types</span></div>
          <div><strong>2</strong><span>New event entries</span></div>
        </div>
      </section>

      <section className="dashboard-shell">
        <div className="dashboard-intro">
          <div>
            <p className="section-label">The grouping plan</p>
            <h2>Good neighbors, explained.</h2>
            <p>These are recommendations, not rules. A house can mix habitats when the family, favorite, or material match is especially useful.</p>
          </div>
          <div className="view-toggle" role="group" aria-label="Choose dashboard view">
            <button className={view === "houses" ? "active" : ""} onClick={() => setView("houses")}><span>▦</span> House plan</button>
            <button className={view === "roster" ? "active" : ""} onClick={() => setView("roster")}><span>☷</span> All Pokémon</button>
          </div>
        </div>

        <div className="filters">
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <span className="sr-only">Search Pokémon, items, or favorites</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Pokémon, items, favorites…" />
          </label>
          <label>
            <span className="sr-only">Filter by ideal habitat</span>
            <select value={habitat} onChange={(event) => setHabitat(event.target.value)}>
              <option>All habitats</option>
              {habitats.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by litter item</span>
            <select value={item} onChange={(event) => setItem(event.target.value)}>
              <option>All litter items</option>
              {items.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
          {(query || habitat !== "All habitats" || item !== "All litter items") ? <button className="reset" onClick={resetFilters}>Reset</button> : null}
        </div>

        <div className="result-line">
          <span>{view === "houses" ? `${filteredHouses.length} houses` : `${filteredRoster.length} Pokémon`}</span>
          <span className="rule" />
          <span>Showing {filteredRoster.length} of {data.roster.length} residents</span>
        </div>

        {view === "houses" ? (
          <div className="house-grid">
            {filteredHouses.map((house) => <HouseCard key={house.id} house={house} />)}
          </div>
        ) : (
          <div className="roster-grid">
            {filteredRoster.map((pokemon) => <RosterCard key={pokemon.slug} pokemon={pokemon} />)}
          </div>
        )}

        {filteredRoster.length === 0 ? (
          <div className="empty-state"><span>✦</span><h2>No residents found</h2><p>Try a broader search or clear the habitat and item filters.</p><button onClick={resetFilters}>Show everyone</button></div>
        ) : null}
      </section>

      <section className="method">
        <div>
          <p className="section-label">How to read the plan</p>
          <h2>Affinity before efficiency.</h2>
        </div>
        <div className="method-grid">
          <article><span>01</span><h3>Habitat first</h3><p>Matching ideal habitat is the cleanest foundation. When a group mixes conditions, the card says so.</p></article>
          <article><span>02</span><h3>Shared joy</h3><p>Favorite categories turn a technically compatible house into one that is much easier to furnish well.</p></article>
          <article><span>03</span><h3>Useful harvests</h3><p>Matching litter is a helpful tie-breaker, but it never forces every producer of one material into the same house.</p></article>
        </div>
      </section>

      <footer className="site-footer">
        <div className="brand"><span>POKO</span><strong>HOMES</strong></div>
        <p>Built from Pokopedia’s checked-in data and refreshed against <a href={data.sources.litter}>Serebii’s current Litter list</a>.</p>
        <p>Pokémon names and imagery belong to their respective owners.</p>
      </footer>
    </main>
  );
}
