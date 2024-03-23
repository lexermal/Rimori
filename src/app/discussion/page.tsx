import Card from './components/Card';

export default function Page(): JSX.Element {
  return (
    <div>
      <h1 className='text-center mt-20 mb-7'>Discussions</h1>
      <p className='text-center mb-8'>
        Now it's time to show what you're capable off! <br />
        Here a 3 opponents and your mission is to show that you understand your
        subject!
      </p>

      <div className='flex'>
        <div className='w-1/3 bg-gray-200 p-5'>
          <Card
            title='Leo (student)'
            src='/images/opponents/kid-1.webp'
            description="He heared the first time about your subject. It's confusing but he wants to undstand it. Can you explain it in easy terms?"
          />
        </div>
        <div className='w-1/3 bg-gray-300 p-5'>
          <Card
            title='Clarence (fixed mindset)'
            src='/images/opponents/mindset-1.webp'
            description="He has a fixed oppinion about your subject that is outdated. Can you convince him how it really looks like?"
          />
        </div>
        <div className='w-1/3 bg-gray-400 p-5'>
        <Card
            title='Elena (entrepreneur)'
            src='/images/opponents/inventor-1.webp'
            description="She is excited about your subject and thinks one step further. She wants to apply it in a different field. Can you explain her how it would be possible?"
          />
        </div>
      </div>
    </div>
  );
}
