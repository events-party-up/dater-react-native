import cloudinary from 'cloudinary-core';
import { PixelRatio } from 'react-native';

const cloudinaryClient = new cloudinary.Cloudinary({ cloud_name: 'dater', secure: true });

export default function cloudinaryUrl(publicId, options) {
  return cloudinaryClient.url(
    publicId,
    {
      ...options,
      // return image taking into consideration device's Pixel Density
      width: options.width ? PixelRatio.getPixelSizeForLayoutSize(options.width) : undefined,
      height: options.height ? PixelRatio.getPixelSizeForLayoutSize(options.height) : undefined,
    },
  );
}
