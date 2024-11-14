import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "../elements/button";
import { MusicPlayer } from "../modules/MusicPlayer";
import AccountDetails from "./AccountDetails";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../elements/dropdown-menu";

export const SettingsDropDown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <FontAwesomeIcon icon={faGear} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={20}>
        <DropdownMenuLabel className="text-xl font-bold">
          Sound
        </DropdownMenuLabel>
        <DropdownMenuItem>
          <MusicPlayer />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xl font-bold">
          Account
        </DropdownMenuLabel>
        <div className="p-1 flex flex-col gap-2">
          <AccountDetails />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SettingsDropDown;
