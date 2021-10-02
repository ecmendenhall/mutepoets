import Contracts from "../components/Contracts";
import FullPage from "../layouts/FullPage";

const About = () => {
  return (
    <FullPage subhed='"So tell me librarian, do you want an army of mute Poets or a Poet who can speak a lot of things?"'>
      <div className="font-body text-l">
        <div className="flex flex-col md:flex-row justify-evenly">
          <div className="mb-4">
            <Contracts />
          </div>
          <div className="md:w-1/3 mb-4">
            <h4 className="font-black font-display text-l uppercase mb-2">
              How it works
            </h4>
            <p className="mb-4">
              Your mute Poets may take a vow of silence. To take the vow, your
              Poet must have no words. When your poet takes a vow of silence, it
              is transferred from your wallet to the Mute Poets contract.
            </p>
            <p className="mb-4">
              Silent poets may break their vow at any time. They will be
              transferred back to your wallet.
            </p>
            <p className="mb-4">
              You may claim 1 SILENCE token per day, per silent poet. You must
              claim SILENCE from the address used to take the vow of silence.
            </p>
            <p className="mb-4">
              Your Poet may have no words, but SILENCE is their voice: we will
              use it to decide how to play the game together.
            </p>
          </div>
        </div>
      </div>
    </FullPage>
  );
};

export default About;
