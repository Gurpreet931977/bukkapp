import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          background: '#111111',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* First Geometric 'P' in White */}
          <path
            d="M7 6H17C20.3137 6 23 8.68629 23 12C23 15.3137 20.3137 18 17 18H12V30H7V6Z"
            fill="#FFFFFF"
          />
          <path
            d="M12 11H16.5C17.8807 11 19 12.1193 19 13.5C19 14.8807 17.8807 16 16.5 16H12V11Z"
            fill="#111111"
          />

          {/* Second Stepped 'P' in Electric Lime #C7F36B */}
          <path
            d="M17 10H26C28.7614 10 31 12.2386 31 15C31 17.7614 28.7614 20 26 20H21.5V30H17V10Z"
            fill="#C7F36B"
          />
          <path
            d="M21.5 14H25C25.8284 14 26.5 14.6716 26.5 15.5C26.5 16.3284 25.8284 17 25 17H21.5V14Z"
            fill="#111111"
          />

          <circle cx="28.5" cy="8.5" r="2.5" fill="#C7F36B" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
