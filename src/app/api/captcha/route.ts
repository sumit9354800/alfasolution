
import { NextResponse } from "next/server";
import {
  createCaptchaToken,
  generateCaptchaCode,
} from "@/lib/captcha";


function safeColor(value: string | null, fallback: string) {
  return value && /^[0-9a-fA-F]{6}$/.test(value)
    ? `#${value}`
    : fallback;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const foreground = safeColor(
      searchParams.get("fg"),
      "#191D27"
    );

    const background = safeColor(
      searchParams.get("bg"),
      "#F4F1EA"
    );

    const answer = generateCaptchaCode();
    const token = createCaptchaToken(answer);

    const characters = answer.split("").map((char, index) => {
      const rotation = randomNumber(-12, 12);
      const y = 35 + randomNumber(-5, 5);

      return `
        <text
          x="${25 + index * 34}"
          y="${y}"
          fill="${foreground}"
          font-size="27"
          font-weight="700"
          font-family="Arial, sans-serif"
          transform="rotate(${rotation} ${25 + index * 34} ${y})"
        >${char}</text>
      `;
    }).join("");

    const lines = Array.from({ length: 5 }, () => {
      const x1 = randomNumber(0, 170);
      const y1 = randomNumber(0, 60);
      const x2 = randomNumber(0, 170);
      const y2 = randomNumber(0, 60);

      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${foreground}" stroke-opacity=".15" stroke-width="1"/>`;
    }).join("");

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="190" height="60" viewBox="0 0 190 60">
        <rect width="190" height="60" fill="${background}"/>
        ${lines}
        ${characters}
      </svg>
    `;

    return NextResponse.json(
      { token, svg },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("CAPTCHA generation error:", error);

    return NextResponse.json(
      { message: "Unable to generate verification code." },
      { status: 500 }
    );
  }
}

function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
