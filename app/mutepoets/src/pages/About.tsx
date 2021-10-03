import Contracts from "../components/Contracts";
import FullPage from "../layouts/FullPage";

const About = () => {
  return (
    <FullPage subhed='"So tell me librarian, do you want an army of mute Poets or a Poet who can speak a lot of things?"'>
      <div className="font-body text-l">
        <div className="flex flex-col md:flex-row justify-evenly">
          <div className="mb-4 flex flex-col">
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
                <li>Discord</li>
                <li>Snapshot</li>
              </ul>
            </div>
            <div className="mb-4">
              <h4 className="font-black font-display text-l uppercase mb-2">
                Created by
              </h4>
              <div className="w-48 bg-gray-100 text-center">
                <img
                  className="shadow"
                  src="https://d1xxei964ioe0z.cloudfront.net/full/5e9323c7b2fef377487d876641230c20c7dccb8daaa4ab23ee1663186ee5467d.png"
                />
                <p className="py-2">
                  <a href="https://twitter.com/ecmendenhall" target="_blank">
                    Poet #6660
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="md:w-1/3 lg:w-1/4 mb-4">
            <h4 className="font-black font-display text-l uppercase mb-2">
              How it works
            </h4>
            <p className="mb-4">
              Mute Poets may take a vow of silence. To take the vow, your Poet
              must have no words. When your poet takes the vow, it is
              transferred from your wallet to the Silence contract.
            </p>
            <p className="mb-4">
              You may claim 1 SILENCE token per day, per silent poet. You must
              claim SILENCE from the address used to take the vow.
            </p>
            <p className="mb-4">
              Silent poets may break their vow at any time. They will be
              transferred back to your wallet, along with any accrued SILENCE.
            </p>
            <p className="mb-4">
              Your Poet may have no words, but SILENCE gives them a voice: we
              will use it to decide how to play the game together.
            </p>
            <p className="mb-4">
              SILENCE grants access to Discord, and determines voting power on
              Snapshot.
            </p>
          </div>
          <div className="md:w-1/3 lg:w-1/4 mb-4">
            <h4 className="font-black font-display text-l uppercase mb-2">
              What about origins?
            </h4>
            <p className="mb-4">
              If we are lucky enough to receive an Origin, we will use SILENCE
              to choose a path together.
            </p>
            <p className="mb-4">
              If the Silence contract receives an Origin Poet, the contract
              owner address may propose a transfer and execute it after a seven
              day waiting period. Only Origins may be transferred in this
              manner.
            </p>
            <p className="mb-4">
              The intent of this mechanism is to transfer any Origins to a new
              contract that can carry out the actions that our silent Poets
              collectively decide.
            </p>
            <h4 className="font-black font-display text-l uppercase mb-2">
              Important notes
            </h4>
            <p className="mb-4">
              This project is about cooperating with each other, exploring the
              world Pak has built, and creating a myth of our own. If you want
              to make money, look elsewhere. If you want to write poetry
              together, take the vow.
            </p>
            <p className="mb-4">
              The Silence contract is simple, well tested, and unaudited. Use
              this app at your own risk.
            </p>
          </div>
        </div>
      </div>
    </FullPage>
  );
};

export default About;
