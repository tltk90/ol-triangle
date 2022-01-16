import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import OlMap from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import TileDebug from 'ol/source/TileDebug';
import XYZ from 'ol/source/XYZ';
import WKT from 'ol/format/WKT';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import View from 'ol/View';
import TileGrid from 'ol/tilegrid/TileGrid';
import { transformExtent } from 'ol/proj';
import { getForProjection as getTileGridForProjection } from 'ol/tilegrid';
@Component({
  selector: 'app-ol',
  templateUrl: './ol.component.html',
  styleUrls: ['./ol.component.css']
})
export class OlComponent implements AfterViewInit {
  @ViewChild('map', { static: false }) mapRef: ElementRef;
  map: OlMap;
  showTriangle = false;
  showFootprint = false;
  layerMap: { baseMap: any, footprint?: any, debug: any, image?: any, imageWithGrid?: any } = {
    baseMap: new TileLayer({ source: new OSM() }),
    debug: new TileLayer({ source: new TileDebug() })
  };

  constructor() {
  }

  ngAfterViewInit(): void {
    this.map = this.createMap();
    this.createImageLayer();
    this.createImageLayerWithCustomTileGrid();
    this.createFootprintLayer();
  }

  toggleImageLayer(customTileGrid?: boolean): void {
    if (customTileGrid) {
      if (this.map.getLayers().getArray().some( l => l === this.layerMap.imageWithGrid)){
        this.map.removeLayer(this.layerMap.imageWithGrid);
      } else {
        this.map.addLayer(this.layerMap.imageWithGrid);
      }
    }else {
      if (this.map.getLayers().getArray().some( l => l === this.layerMap.image)){
        this.map.removeLayer(this.layerMap.image);
      } else {
        this.map.addLayer(this.layerMap.image);
      }
    }
  }

  toggleGrid(): void {
    if (this.layerMap.debug.getVisible()) {
      this.layerMap.debug.setVisible(false);
    } else {
      this.layerMap.debug.setVisible(true);
    }
  }

  toggleTriangle(): void {
    this.showTriangle = !this.showTriangle;
    this.layerMap.image?.getSource()?.setRenderReprojectionEdges(this.showTriangle);
    this.layerMap?.imageWithGrid.getSource()?.setRenderReprojectionEdges(this.showTriangle);
  }

  showImageFootprint(): void {
    this.showFootprint = !this.showFootprint;
    if (this.showFootprint) {
      this.map.addLayer(this.layerMap.footprint);
    } else {
      this.map.removeLayer(this.layerMap.footprint);
    }
  }

  private createMap(): OlMap {
    return new OlMap({
      layers: [this.layerMap.baseMap, this.layerMap.debug],
      target: this.mapRef.nativeElement,
      view: new View({
        projection: 'EPSG:4326',
        center: [-95.8051595, 29.779252010849483],
        zoom: 17
      })
    });
  }

  private buildTileGridToImage(): TileGrid {
    const viewProjection = this.map.getView().getProjection();
    const viewTileGrid = getTileGridForProjection(viewProjection);
    const bbox = transformExtent(
      [-95.807333, 29.777778, -95.802986, 29.780726], 'EPSG:4326', viewProjection);
    const tileGrid = new TileGrid({
      extent: bbox,
      resolutions: viewTileGrid.getResolutions(),
    });

    return tileGrid;

  }

  private createImageLayer(): void {
    const source = new XYZ({
      url: 'https://tiles.openaerialmap.org/61d768d4c0ab110007f14fa1/0/61d768d4c0ab110007f14fa2/{z}/{x}/{y}',
      crossOrigin: 'Anonymous',
      projection: 'EPSG:3857'
    });
    this.layerMap.image = new TileLayer({
      className: 'image-layer',
      source
    });
  }

  private createFootprintLayer(): void {
    const footprintWkt = 'POLYGON ((-95.807333 29.777778, -95.802986 29.777778, -95.802986 29.780726, -95.807333 29.780726, -95.807333 29.777778))';

    const formater = new WKT();
    const footprint = formater.readFeature(footprintWkt, 'EPSG:4326', 'EPSG:4326');
    this.layerMap.footprint = new VectorLayer({
      source: new VectorSource({
        features: [footprint]
      })
    });
  }

  private createImageLayerWithCustomTileGrid(): void {
    const tileGrid = this.buildTileGridToImage();
    const source = new XYZ({
      url: 'https://tiles.openaerialmap.org/61d768d4c0ab110007f14fa1/0/61d768d4c0ab110007f14fa2/{z}/{x}/{y}',
      crossOrigin: 'Anonymous',
      projection: 'EPSG:3857'
    });
    source.setTileGridForProjection(this.map.getView().getProjection(), tileGrid);
    this.layerMap.imageWithGrid = new TileLayer({
      className: 'image-layer-custom-grid',
      source
    });
  }
}
