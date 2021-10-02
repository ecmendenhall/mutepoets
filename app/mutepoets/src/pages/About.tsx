import Contracts from "../components/Contracts";
import FullPage from "../layouts/FullPage";

const About = () => {
  return (
    <FullPage subhed='"So tell me librarian, do you want an army of mute Poets or a Poet who can speak a lot of things?"'>
      <div className="font-body text-l">
        <div className="flex flex-col md:flex-row justify-evenly">
          <div className="mb-4 flex flex-col justify-between">
            <div className="mb-4">
              <Contracts />
            </div>
            <div className="mb-4">
              <h4 className="font-black font-display text-l uppercase mb-2">
                Community
              </h4>
              <ul>
                <li>Discord</li>
              </ul>
            </div>
            <div className="mb-4">
              <h4 className="font-black font-display text-l uppercase mb-2">
                Creator
              </h4>
              <div className="w-32 bg-gray-100 text-center">
                <img
                  className="shadow"
                  src="https://d1xxei964ioe0z.cloudfront.net/full/5e9323c7b2fef377487d876641230c20c7dccb8daaa4ab23ee1663186ee5467d.png"
                />
                <p className="py-2">Poet #6660</p>
              </div>
            </div>
          </div>
          <div className="md:w-1/3 mb-4">
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
          </div>
        </div>
      </div>
    </FullPage>
  );
};

export default About;
