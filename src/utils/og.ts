import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from '@vercel/og';

export async function generateToolOpenGraph({
  title,
  description,
  imagePath,
}: {
  title: string;
  description: string;
  imagePath: string;
}) {
  const [image, NunitoBlack, NunitoMedium] = await Promise.all([
    readFile(imagePath),
    readFile(path.resolve('./fonts/Nunito-Black.ttf')),
    readFile(path.resolve('./fonts/Nunito-Medium.ttf')),
  ]);

  return new ImageResponse(
    {
      type: 'div',
      props: {
        // @ts-expect-error - tw is a valid prop
        tw: 'flex flex-col w-full h-full px-40',
        style: {
          backgroundColor: 'oklch(14.1% 0.005 285.823)',
        },
        children: [
          {
            type: 'div',
            props: {
              tw: 'flex-1 flex flex-col items-center justify-center',
              children: [
                {
                  type: 'div',
                  props: {
                    tw: 'flex items-center justify-center w-[200px] h-[200px] bg-white rounded-3xl',
                    children: [
                      {
                        type: 'img',
                        props: {
                          tw: 'w-[136px] h-[136px]',
                          src: `data:image/svg+xml;base64,${image.toString('base64')}`,
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    tw: 'flex text-center text-white text-6xl mt-12 leading-[1.1]',
                    style: {
                      fontFamily: 'Nunito Black',
                    },
                    children: title,
                  },
                },
                {
                  type: 'div',
                  props: {
                    tw: 'flex text-center text-white text-3xl mt-4 leading-tight',
                    style: {
                      fontFamily: 'Nunito Medium',
                    },
                    children: description,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              tw: 'flex items-center mx-auto pb-8 text-white',
              style: {
                fontFamily: 'Nunito Black',
              },
              children: [
                {
                  type: 'svg',
                  props: {
                    width: 48,
                    height: 48,
                    viewBox: '0 0 24 24',
                    xmlns: 'http://www.w3.org/2000/svg',
                    children: [
                      {
                        type: 'path',
                        props: {
                          fill: 'currentColor',
                          d: 'M18 16h-2v-1H8v1H6v-1H2v5h20v-5h-4zm2-8h-3V6c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v4h4v-2h2v2h8v-2h2v2h4v-4c0-1.1-.9-2-2-2m-5 0H9V6h6z',
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    tw: 'pl-4 text-3xl',
                    children: 'Better Self Toolbox',
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 600,
      fonts: [
        {
          name: 'Nunito Black',
          data: NunitoBlack.buffer,
          style: 'normal',
        },
        {
          name: 'Nunito Medium',
          data: NunitoMedium.buffer,
          style: 'normal',
        },
      ],
    },
  );
}
