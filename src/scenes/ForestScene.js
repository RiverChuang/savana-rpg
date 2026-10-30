import { icon, escapeHtml as e } from '../ui/icons.js';
const markers = { dialogue: 'chat', clue: 'sparkle', side: 'leaf', enemy: 'sword', decision: 'compass', pledge: 'book' };

export function forestScene(state, location, started) {
  const hotspots = location.hotspots.filter(h => h.kind === 'enemy' ? !state.defeated.includes(h.id) : h.kind === 'dialogue' || !state.interactions.includes(h.id));
  const extras = location.biome === 'camp' ? '<div class="camp-tent"></div><div class="camp-fire"><i></i><i></i></div>' :
    location.biome === 'water' ? '<div class="stream-water"></div>' : location.biome === 'dawn' ? '<div class="sunrise"></div>' : '';
  return `<div class="forest-scene biome-${location.biome} ${started ? '' : 'unstarted'}">
    <div class="forest-art"></div>${extras}<div class="mist mist-one"></div><div class="mist mist-two"></div>
    <div class="fireflies" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => `<i style="--i:${i};left:${12 + i * 7}%;top:${24 + (i * 17) % 48}%"></i>`).join('')}</div>
    <div class="map-location"><span class="eyebrow">${icon('compass')} CURRENT LOCATION</span><h2>${e(location.name)}</h2><p>${e(location.subtitle)}</p></div>
    <span class="weather">${icon('sun')}${e(location.weather)}</span>
    ${started ? hotspots.map(h => `<button class="hotspot hotspot-${h.kind} ${state.interactions.includes(h.id) ? 'visited' : ''}" style="left:${h.x}%;top:${h.y}%" data-action="interact" data-param="${e(h.id)}" aria-label="${e(h.label)}"><span class="marker">${icon(markers[h.kind])}</span><span class="marker-label">${e(h.label)}</span></button>`).join('') : ''}
    ${started ? `<div id="traveler" class="map-traveler" style="left:${state.player.position.x}%;top:${state.player.position.y}%"><span class="traveler-name">${e(state.player.name)}</span><img src="./assets/characters/traveler.svg" alt="你的旅人角色" draggable="false"><span class="traveler-shadow"></span></div>` : ''}
    <div class="map-compass" aria-hidden="true"><span>N</span>${icon('compass')}</div>
    <button class="map-overview subtle-button" data-action="menu" data-param="map" ${started ? '' : 'disabled'}>${icon('map')} 探索足跡</button>
    <div class="scene-caption">原創森林世界 <span>·</span> GAME FICTION</div>
  </div>`;
}
