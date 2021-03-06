import Contracts from "../components/Contracts";
import FullPage from "../layouts/FullPage";

const About = () => {
  return (
    <FullPage subhed='"So tell me librarian, do you want an army of mute Poets or a Poet who can speak a lot of things?"'>
      <div className="font-body text-l">
        <div className="flex flex-col md:flex-row justify-evenly">
          <div className="mb-4 px-2 flex flex-col">
            <div className="mb-4">
              <Contracts />
            </div>
            <div className="mb-4">
              <h4 className="font-black font-display text-l uppercase mb-2">
                Code
              </h4>
              <ul>
                <li>
                  <a
                    href="https://github.com/ecmendenhall/mutepoets"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Github
                  </a>
                </li>
              </ul>
            </div>
            <div className="mb-4">
              <h4 className="font-black font-display text-l uppercase mb-2">
                Community
              </h4>
              <ul>
                <li>
                  <a
                    href="https://alpha.guild.xyz/silence"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Guild
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.gg/DMBasrV98p"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href="https://snapshot.org/#/mutepoets.eth"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Snapshot
                  </a>
                </li>
              </ul>
            </div>
            <div className="mb-4">
              <h4 className="font-black font-display text-l uppercase mb-2">
                Created by
              </h4>
              <div className="w-36 xl:w-48 bg-gray-100 text-center shadow">
                <a
                  href="https://twitter.com/eth_call"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="group relative flex flex-col place-content-center cursor-pointer">
                    <img
                      className="object-cover"
                      alt="Poet #6660"
                      src="https://d1xxei964ioe0z.cloudfront.net/full/5e9323c7b2fef377487d876641230c20c7dccb8daaa4ab23ee1663186ee5467d.png"
                    />
                    <div className="hidden group-hover:block absolute text-white bg-gray-900 w-full bottom-4 p-2 xl:p-4">
                      Poet #6660
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
          <div className="md:w-1/3 lg:w-1/4 mb-4 px-2">
            <h4 className="font-black font-display text-l uppercase mb-2">
              How it works
            </h4>
            <p className="mb-4">
              Mute Poets may take a vow of silence. To take the vow, your Poet
              must have no words. If you have any eligible Poets, they will
              appear on the Vows page.
            </p>
            <p className="mb-4">
              When your poet takes the vow, it is transferred from your wallet
              to the Silence contract. Your Poet remains yours at all times.
              Only you may take and break the vow for your Poet.
            </p>
            <p className="mb-4">
              You may claim at least 1 SILENCE per day, per silent poet. You
              must claim SILENCE from the address used to take the vow. Claims
              cost gas, so you may wish to let your SILENCE accrue for a while.
            </p>
            <p className="mb-4">
              Unbroken vows accrue additional SILENCE over time, up to a maximum
              of 5 SILENCE per day at 360 days.
            </p>
            <p className="mb-4">
              Silent poets may break their vow at any time. They will be
              transferred back to your wallet, along with any accrued SILENCE.
            </p>
            <p className="mb-4">
              Our poets may have no words, but SILENCE gives them a voice: we
              will use it as a coordination token to decide how to play the game
              together.
            </p>
          </div>
          <div className="md:w-1/3 lg:w-1/4 mb-4 px-2">
            <h4 className="font-black font-display text-l uppercase mb-2">
              What about origins?
            </h4>
            <p className="mb-4">
              If we are lucky enough to receive an Origin Poet, we will use
              SILENCE to choose a path together.
            </p>
            <p className="mb-4">
              If the Silence contract receives an Origin, the contract owner
              address (a Gnosis Safe) may propose a transfer and execute it
              after a seven day waiting period. Only Origins may be transferred
              in this manner.
            </p>
            <p className="mb-4">
              The intent of this mechanism is to transfer any Origins to a new
              contract that can carry out whatever action our silent Poets
              collectively decide.
            </p>
            <h4 className="font-black font-display text-l uppercase mb-2">
              Important notes
            </h4>
            <p className="mb-4">
              This project is about cooperating with each other, exploring the
              game Pak created, and making a myth of our own. If you want to
              make money, look elsewhere. If you want to write poetry together,
              take the vow.
            </p>
            <p className="mb-4">
              The path we choose is not decided or guaranteed. Lost Poets has
              secrets and twists that remain, and the game we are playing
              together may change. Do not take the vow with any expectation
              about the outcome.
            </p>
            <p className="mb-4">
              The Silence contract is unaudited and provided as is. Take the vow
              at your own risk.
            </p>
            <p className="mb-4">
              Do not send tokens or NFTs directly to the Silence contract. They
              will be lost forever and cannot be recovered.
            </p>
          </div>
        </div>
      </div>
    </FullPage>
  );
};

export default About;
