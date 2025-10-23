/**
 * Extended Leaflet Type Definitions for Internal APIs
 *
 * Diese Definitionen erweitern die offiziellen Leaflet-Typen um interne/private APIs,
 * die für den Leaflet Race Condition Fix benötigt werden.
 *
 * WICHTIG: Diese APIs sind Leaflet-intern und können zwischen Versionen ändern.
 * Sie sind mit Underscore-Prefix markiert um den privaten Status zu kennzeichnen.
 *
 * Referenzen:
 * - https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Marker.js
 * - https://github.com/Leaflet/Leaflet/blob/main/src/layer/Popup.js
 * - https://github.com/Leaflet/Leaflet/blob/main/src/layer/Tooltip.js
 * - GitHub Issue #4453: https://github.com/Leaflet/Leaflet/issues/4453
 * - Stack Overflow: https://stackoverflow.com/questions/44803875/
 */

import * as L from 'leaflet'

declare module 'leaflet' {
  /**
   * Extended Map type with internal animation method
   */
  interface Map {
    /**
     * Interne Methode zur Konvertierung von LatLng zu Pixel-Koordinaten während Zoom-Animation
     * @internal
     * @param latlng - Geografische Koordinaten
     * @param zoom - Ziel-Zoom-Level
     * @param center - Animations-Zentrum
     * @returns Pixel-Koordinaten als Point
     */
    _latLngToNewLayerPoint(latlng: LatLng, zoom: number, center: LatLng): Point
  }

  /**
   * Extended Marker type with internal properties and methods
   */
  interface Marker {
    /**
     * Interne Speicherung der Marker-Koordinaten
     * @internal
     */
    _latlng: LatLng

    /**
     * Interne Methode zum Setzen der DOM-Position des Markers
     * @internal
     * @param pos - Pixel-Position als Point
     */
    _setPos(pos: Point): void

    /**
     * Interne Methode die während Zoom-Animation aufgerufen wird
     * @internal
     * @param opt - Animations-Optionen mit Zoom-Level und Zentrum
     */
    _animateZoom(opt: { zoom: number; center: LatLng }): void

    /**
     * Referenz zur Map auf der dieser Marker liegt (null wenn nicht auf Map)
     * @internal
     */
    _map: Map | null
  }

  /**
   * Extended Popup type with internal properties and methods
   */
  interface Popup {
    /**
     * Interne Speicherung der Popup-Anker-Koordinaten
     * @internal
     */
    _latlng: LatLng

    /**
     * Internes DOM-Container-Element
     * @internal
     */
    _container: HTMLElement

    /**
     * Interne Methode zur Berechnung des Popup-Anker-Offsets
     * @internal
     * @returns Anker-Offset als Point
     */
    _getAnchor(): Point

    /**
     * Interne Methode die während Zoom-Animation aufgerufen wird
     * @internal
     * @param e - Zoom-Event mit Zoom-Level und Zentrum
     */
    _animateZoom(e: { zoom: number; center: LatLng }): void

    /**
     * Referenz zur Map auf der dieses Popup liegt (null wenn nicht auf Map)
     * @internal
     */
    _map: Map | null
  }

  /**
   * Extended Tooltip type with internal properties and methods
   */
  interface Tooltip {
    /**
     * Interne Speicherung der Tooltip-Anker-Koordinaten
     * @internal
     */
    _latlng: LatLng

    /**
     * Internes DOM-Container-Element
     * @internal
     */
    _container: HTMLElement

    /**
     * Interne Methode zur Berechnung des Tooltip-Anker-Offsets
     * @internal
     * @returns Anker-Offset als Point
     */
    _getAnchor(): Point

    /**
     * Interne Methode die während Zoom-Animation aufgerufen wird
     * @internal
     * @param e - Zoom-Event mit Zoom-Level und Zentrum
     */
    _animateZoom(e: { zoom: number; center: LatLng }): void

    /**
     * Referenz zur Map auf der dieses Tooltip liegt (null wenn nicht auf Map)
     * @internal
     */
    _map: Map | null
  }
}
