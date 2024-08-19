import { OAuthProvider } from 'appwrite';

import { AppwriteSingleton } from '@/app/appwrite';

const GoogleAuthButton = (props: { frontendUrl: string, apiEndpoint: string, projectId: string }) => {
  AppwriteSingleton.init(props.apiEndpoint, props.projectId);
  const account = AppwriteSingleton.getAccount();

  const handleGoogleSignIn = async () => {
    try {
      // console.log('Domain:', props.frontendUrl);
      const response = await account.createOAuth2Session(OAuthProvider.Google, props.frontendUrl + '/auth/callback');
      console.log(response);
    } catch (error) {
      console.error('Sign In failed', error);
    }
  };

  return (
    <div className="flex justify-center">
      <button
        onClick={handleGoogleSignIn}
        className="flex items-center bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out p-2"
      >
        <img src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google"
          className="h-6 w-6 mr-2"
        />
        <span className="text-gray-800 font-semibold">Sign In with Google</span>
      </button>
    </div>
  );
};

export default GoogleAuthButton;
