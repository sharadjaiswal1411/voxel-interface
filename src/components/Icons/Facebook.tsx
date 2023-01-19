import React from 'react'

export default function Facebook({ size, color }: { size?: number | string; color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || '36'} height={size || '36'} viewBox="0 0 36 36" fill="none">
      <g clipPath="url(#clip0_4036_80040)">
        <path
          d="M20.4305 35.9297H14.6541C13.6893 35.9297 12.9044 35.1464 12.9044 34.1834V21.18H9.53436C8.56953 21.18 7.78467 20.3964 7.78467 19.4337V13.8617C7.78467 12.8988 8.56953 12.1154 9.53436 12.1154H12.9044V9.3252C12.9044 6.55856 13.7749 4.20474 15.4213 2.51862C17.0753 0.824799 19.3866 -0.0703125 22.1056 -0.0703125L26.5109 -0.0631714C27.4741 -0.0615234 28.2576 0.721802 28.2576 1.68311V6.85657C28.2576 7.81952 27.473 8.60285 26.5084 8.60285L23.5424 8.60394C22.6378 8.60394 22.4075 8.78494 22.3582 8.84042C22.277 8.93244 22.1804 9.19254 22.1804 9.91077V12.1152H26.2855C26.5946 12.1152 26.894 12.1913 27.1513 12.3346C27.7064 12.6442 28.0515 13.2295 28.0515 13.862L28.0493 19.434C28.0493 20.3964 27.2644 21.1797 26.2996 21.1797H22.1804V34.1834C22.1804 35.1464 21.3953 35.9297 20.4305 35.9297ZM15.019 33.8192H20.0656V20.2352C20.0656 19.5922 20.5898 19.0692 21.2338 19.0692H25.9347L25.9366 14.2259H21.2335C20.5895 14.2259 20.0656 13.703 20.0656 13.06V9.91077C20.0656 9.08624 20.1495 8.14856 20.7731 7.44379C21.5266 6.5918 22.714 6.49347 23.5418 6.49347L26.143 6.49237V2.04675L22.1039 2.04016C17.7344 2.04016 15.019 4.83179 15.019 9.3252V13.06C15.019 13.7027 14.495 14.2259 13.8511 14.2259H9.89927V19.0692H13.8511C14.495 19.0692 15.019 19.5922 15.019 20.2352V33.8192ZM26.5068 2.0473H26.5071H26.5068Z"
          fill={color || '#A7B6BD'}
        />
      </g>
    </svg>
  )
}


export  function FacebookNew({ size, color }: { size?: number | string; color?: string }) {
  return (
    <svg viewBox="0 0 512 512" preserveAspectRatio="xMidYMid meet" width={size || '36'} height={size || '36'}>
          <path fill={color || '#A7B6BD'} d="M211.9 197.4h-36.7v59.9h36.7V433.1h70.5V256.5h49.2l5.2-59.1h-54.4c0 0 0-22.1 0-33.7 0-13.9 2.8-19.5 16.3-19.5 10.9 0 38.2 0 38.2 0V82.9c0 0-40.2 0-48.8 0 -52.5 0-76.1 23.1-76.1 67.3C211.9 188.8 211.9 197.4 211.9 197.4z"></path>
    </svg>
  )
}

