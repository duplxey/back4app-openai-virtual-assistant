import robotImage from "../assets/avatar.png";

function AssistantMessage({content}) {
  return (
    <div className="text-left">
      <div className="flex items-center">
        <img src={robotImage} alt="Assistant Avatar" className="w-12 h-12 inline-block mr-1"/>
        <div>
          <div className="inline-block bg-gray-200 py-2 px-3 rounded-xl">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssistantMessage;