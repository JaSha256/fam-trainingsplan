/**
 * Type declarations for leaflet.markercluster
 * @see https://github.com/Leaflet/Leaflet.markercluster
 */

import type { Layer, Marker, FeatureGroup, Icon, DivIcon, LayerOptions, PolylineOptions, FitBoundsOptions } from 'leaflet';

// Augment global L namespace - needed after dynamic import
declare module 'leaflet' {
  interface MarkerClusterGroupOptions extends LayerOptions {
    showCoverageOnHover?: boolean
    zoomToBoundsOnClick?: boolean
    spiderfyOnMaxZoom?: boolean
    removeOutsideVisibleBounds?: boolean
    animate?: boolean
    animateAddingMarkers?: boolean
    disableClusteringAtZoom?: number
    maxClusterRadius?: number | ((zoom: number) => number)
    polygonOptions?: PolylineOptions
    singleMarkerMode?: boolean
    spiderfyDistanceMultiplier?: number
    spiderLegPolylineOptions?: PolylineOptions
    iconCreateFunction?: (cluster: MarkerCluster) => Icon | DivIcon
    chunkedLoading?: boolean
    chunkDelay?: number
    chunkInterval?: number
    chunkProgress?: (processed: number, total: number, elapsed: number) => void
  }

  interface MarkerCluster extends Marker {
    getChildCount(): number
    getAllChildMarkers(): Marker[]
    zoomToBounds(options?: FitBoundsOptions): void
  }

  class MarkerClusterGroup extends FeatureGroup {
    constructor(options?: MarkerClusterGroupOptions)
    addLayer(layer: Layer): this
    addLayers(layers: Layer[] | Marker[]): this
    removeLayer(layer: Layer): this
    removeLayers(layers: Layer[] | Marker[]): this
    clearLayers(): this
    getVisibleParent(marker: Marker): Marker | MarkerCluster
    refreshClusters(layers?: Layer | Layer[] | Marker | Marker[]): this
    getChildCount(): number
    getAllChildMarkers(): Marker[]
    hasLayer(layer: Layer): boolean
    addTo(map: any): this
  }

  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup
}

// Module declaration for dynamic import (side-effect module)
declare module 'leaflet.markercluster';

// CSS module declarations
declare module 'leaflet.markercluster/dist/MarkerCluster.css';
declare module 'leaflet.markercluster/dist/MarkerCluster.Default.css';
