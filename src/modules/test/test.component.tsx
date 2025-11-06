"use client";
import { Button } from "antd";

import { message } from "antd";

export default function TestMessage() {
	const onClick = () => {
		message.success("AntD message hoạt động!");
	};

	return <Button onClick={onClick}>Test Message</Button>;
}
