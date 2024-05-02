
"use client";

import { Avatar, Dropdown, Navbar } from "flowbite-react";

export function CustomNavbar() {
  return (
    <Navbar  rounded className="fixed w-full top-0" >
      <Navbar.Brand href="/go?empty">
        <div className="mr-3 h-20 w-40 overflow-hidden fixed " style={{
          backgroundImage: 'url("/logo.svg")',
          backgroundSize: '320px',
          backgroundPosition: 'center',
          backgroundColor: 'white',
          top: '0',
          left: '0',
        }}>
        {/* <img src="/logo.svg" className="mr-3 h-40" alt="Flowbite React Logo" /> */}
          </div>
        {/* <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Flowbite React</span> */}
      </Navbar.Brand>
      <div className="flex md:order-2 mb-16">
        <img src="/qr.png" className=" h-36 fixed right-2 top-2 rounded-lg"/>

        {/* <Dropdown
          arrowIcon={false}
          inline
          label={
            <Avatar alt="User settings" img="https://flowbite.com/docs/images/people/profile-picture-5.jpg" rounded />
          }
        >
          <Dropdown.Header>
            <span className="block text-sm">Alexander Weixler</span>
            <span className="block truncate text-sm font-medium">alexander@riau.ai</span>
          </Dropdown.Header>
          {/* <Dropdown.Item>Dashboard</Dropdown.Item> */}
          {/* <Dropdown.Item>Settings</Dropdown.Item> */}
          {/* <Dropdown.Item>Earnings</Dropdown.Item> */}
          {/* <Dropdown.Divider />
          <Dropdown.Item>Sign out</Dropdown.Item>
        </Dropdown> */}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        {/* <Navbar.Link href="#" active>
          Home
        </Navbar.Link> */}
        <Navbar.Link href="/go">Study</Navbar.Link>
        <Navbar.Link target="_blank" href="http://www.educationplanner.org/students/self-assessments/learning-styles">Study Type</Navbar.Link>
        <Navbar.Link disabled href="#">Plan your study</Navbar.Link>
        {/* <Navbar.Link href="#">Pricing</Navbar.Link> */}
        {/* <Navbar.Link href="#">Contact</Navbar.Link> */}
      </Navbar.Collapse>
    </Navbar>
  );
}
