import cloudinary from 'cloudinary-core';
import { PixelRatio } from 'react-native';

const cloudinaryClient = new cloudinary.Cloudinary({ cloud_name: 'dater', secure: true });
/**
 * Generates Pixel Density aware Cloudinary URL
 * @param {*} imageOptions.publicId Cloudinary image public_id
 * @param {*} imageOptions.version Cloudinary image version, used to replace existing photos
 * @param {*} options see https://cloudinary.com/documentation/javascript_image_manipulation for options
 */
export default function cloudinaryUrl(imageOptions: {
  publicId: string,
  version: number,
}, transofmrations) {
  const imageUrl = imageOptions.version ? `v${imageOptions.version}/${imageOptions.publicId}` : imageOptions.publicId;
  const transformedUrl = cloudinaryClient.url(
    imageUrl,
    {
      ...transofmrations,
      // return image taking into consideration device's Pixel Density
      width: transofmrations.width ? PixelRatio.getPixelSizeForLayoutSize(transofmrations.width) : undefined,
      height: transofmrations.height ? PixelRatio.getPixelSizeForLayoutSize(transofmrations.height) : undefined,
    },
  );
  return transformedUrl;
}
