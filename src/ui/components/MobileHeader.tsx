import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../elements/drawer";
import AccountDetails from "./AccountDetails";
import Connect from "./Connect";
import { usePlayer } from "@/hooks/usePlayer";
import HeaderBalance from "./HeaderBalance";
import { useAccount } from "@starknet-react/core";
import { ACCOUNT_CONNECTOR } from "@/hooks/useAccountCustom";

const MobileHeader = () => {
  const { account } = useAccount();
  const { player } = usePlayer({ playerId: account?.address });

  return (
    <div className="px-3 py-2 flex gap-3">
      <Drawer direction="left">
        <DrawerTrigger>
          <FontAwesomeIcon icon={faBars} size="xl" />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-2xl">zKube</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col gap-5 p-4 font-semibold md:font-normal">
            {/* <div className="flex flex-col gap-2 items-center">
              <p className="self-start">Theme</p> <ModeToggle />
            </div> */}
            {/* <div className="flex flex-col gap-2 items-center">
              <p className="self-start">Sound</p> <MusicPlayer />
            </div> */}
            <div className="flex flex-col gap-2 items-center">
              <p className="self-start">Account</p>
              <AccountDetails />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
      <div className="w-full flex justify-between items-center">
        <p className="text-2xl font-bold">zKube</p>
        <div className="flex gap-2">
          {!!player && account ? (
            <div className="flex gap-3 items-center">
              <HeaderBalance />
            </div>
          ) : (
            ACCOUNT_CONNECTOR === "controller" && <Connect />
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
