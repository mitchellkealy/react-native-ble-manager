declare module 'react-native-vector-icons/MaterialIcons' {
    import { TextProps } from 'react-native';
    import * as React from 'react';
  
    export interface IconProps extends TextProps {
      name: string;
      size?: number;
      color?: string;
    }
  
    export default class MaterialIcons extends React.Component<IconProps> {}
  }