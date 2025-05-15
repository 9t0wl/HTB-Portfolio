import React from "react";
import MachineCard from "../components/MachineCard";
import { Typewriter } from "react-simple-typewriter";
import { machines } from "../data/machines";
import "./Home.css";

export default function Home() {
  return (
    <div className="home">
      <section className="intro">
        <h1 className="glitch" data-text="9t0wl’s HTB Portfolio">
          <Typewriter
            words={[
              "9t0wl’s HTB Portfolio",
              "Ethical Hacker",
              "Penetration Tester",
              "Bug Bounty Hunter",
            ]}
            loop={true}
            cursor
            cursorStyle="_"
            typeSpeed={70}
            deleteSpeed={50}
            delaySpeed={1000}
          />
        </h1>
        <p>
          Welcome to my personal hacking portfolio. Explore the machines I’ve
          conquered!
        </p>
      </section>

      <section className="machines">
        {machines.map((machine, index) => (
          <MachineCard
            key={index}
            name={machine.name}
            description={machine.description}
            link={`/machine/${machine.name}`}
            os={machine.os}
            difficulty={machine.difficulty}
            writeupFile={machine.writeupFile}
          />
        ))}
      </section>
    </div>
  );
}
