import { NextResponse } from "next/server";

const coolNames = [
    "tiger",
    "phoenix",
    "spiderman",
    "banana",
    "nebula",
    "gandalf",
    "jazz",
    "elephant",
    "toinfinityandbeyond",
    "blue",
    "unicorn",
    "mars",
    "violin",
    "zeus",
    "apple",
    "dragon",
    "comet",
    "red",
    "harrypotter",
    "green",
    "athena",
    "guitar",
    "panda",
    "viola",
    "superman",
    "carrot",
    "frodo",
];
async function getRadomName() {

    const randomName = coolNames[Math.floor(Math.random() * coolNames.length)];
    const extraNumbers = Math.floor(Math.random() * 10000) + 1000; // Generate 4-5 extra numbers
    return `${randomName}${extraNumbers}`;

}

export async function GET() {
    const name = await getRadomName();
    return NextResponse.json({ name });
}
