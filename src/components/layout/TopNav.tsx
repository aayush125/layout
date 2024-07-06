import React from "react";
import {
  Navbar,
  NavbarContent,
  Input,
  Link,
  NavbarItem,
  NavbarBrand,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
} from "@nextui-org/react";
import { CiSearch } from "react-icons/ci";
import { useTheme } from "../../contexts/ThemeContext";
import { Switch } from "@nextui-org/react";
import { IoMoon } from "react-icons/io5";
import { MdWbSunny } from "react-icons/md";
import { useLocation } from "react-router-dom";
import { Button } from "@nextui-org/react";
import { useAuth } from "../../contexts/AuthContext";
import {
  signInWithGooglePopup,
  signOutofGoogle,
} from "../../utils/firebase.utils";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebase.utils";

export default function TopNav() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isMenuOpen] = React.useState();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { label: "To-do", link: "/todo" },
    { label: "Notes", link: "/notes" },
  ];

  const handleSignIn = async () => {
    try {
      const response = await signInWithGooglePopup();
      console.log(response);
      console.log(response.user.uid);
      if (response) {
        try {
          const userRef = doc(db, "users", `${response.user.uid}`);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            await setDoc(
              userRef,
              { name: response.user.displayName, email: response.user.email },
              { merge: true }
            );
          } else {
            await setDoc(userRef, {
              name: response.user.displayName,
              email: response.user.email,
              noteTags: [],
            });
          }
        } catch (e) {
          console.error("Error adding document: ", e);
        }
      }
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutofGoogle();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <Navbar disableAnimation={false} isBordered>
      <NavbarContent justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <Link color="foreground" href="/">
          <NavbarBrand className="mr-4">
            <p className="hidden sm:block font-bold text-inherit">LAYOUT</p>
          </NavbarBrand>
        </Link>
        <NavbarContent className="hidden sm:flex gap-3">
          <NavbarItem isActive={location.pathname === "/todo" ? true : false}>
            <Link color="foreground" href="/todo">
              To-do
            </Link>
          </NavbarItem>
          <NavbarItem isActive={location.pathname === "/notes" ? true : false}>
            <Link color="foreground" href="/notes">
              Notes
            </Link>
          </NavbarItem>
        </NavbarContent>
      </NavbarContent>
      <NavbarContent as="div" className="items-center" justify="center">
        <Input
          classNames={{
            base: "max-w-full sm:max-w-[10rem] h-10",
            mainWrapper: "h-full",
            input: "text-small",
            inputWrapper:
              "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
          }}
          placeholder="Type to search..."
          size="sm"
          startContent={<CiSearch size={18} />}
          type="search"
        />
      </NavbarContent>
      <NavbarContent justify="end">
        <Switch
          isSelected={darkMode}
          size="sm"
          color="primary"
          startContent={<MdWbSunny></MdWbSunny>}
          endContent={<IoMoon></IoMoon>}
          onChange={toggleDarkMode}
        ></Switch>
        {!user ? (
          <Button onClick={handleSignIn}>Sign in</Button>
        ) : (
          <Dropdown
            className={`${
              darkMode ? "dark" : ""
            } text-foreground bg-background`}
            placement="bottom-end"
          >
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                name={user.displayName ? user.displayName : undefined}
                size="sm"
                src={user.photoURL ? user.photoURL : undefined}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{user.email}</p>
              </DropdownItem>
              <DropdownItem key="settings">Settings</DropdownItem>
              <DropdownItem key="help_and_feedback">
                Help & Feedback
              </DropdownItem>
              <DropdownItem onClick={handleSignOut} key="logout" color="danger">
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
      </NavbarContent>
      <NavbarMenu
        className={`${darkMode ? "dark" : ""} text-foreground bg-background`}
      >
        {menuItems.map((item, index) => (
          <NavbarMenuItem
            key={`${item.label}-${index}`}
            isActive={location.pathname === item.link}
          >
            <Link
              color="foreground"
              className="w-full"
              href={item.link}
              size="sm"
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}
