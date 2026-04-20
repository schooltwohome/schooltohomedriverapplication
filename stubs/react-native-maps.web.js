/**
 * Web stub: real react-native-maps pulls native codegen. Metro resolves this file
 * for platform "web" so SSR / require.context can bundle app code that imports maps.
 */
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { View } from "react-native";

const MapView = forwardRef(function MapViewStub(props, ref) {
  const innerRef = useRef(null);
  useImperativeHandle(ref, () => ({
    animateToRegion() {},
    fitToCoordinates() {},
  }));
  return (
    <View ref={innerRef} style={props.style}>
      {props.children}
    </View>
  );
});

export default MapView;

export function Marker() {
  return null;
}

export function Polyline() {
  return null;
}
