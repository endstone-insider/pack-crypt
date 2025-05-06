"use client";

import { Tabs, Tab } from "@heroui/tabs";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { useState } from "react";

import { title, subtitle } from "@/components/primitives";
import { DownloadIcon, RandomIcon } from "@/components/icons";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { RadioGroup, Radio } from "@heroui/radio";
import { Link } from "@heroui/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Divider } from "@heroui/divider";
import { Code } from "@heroui/code";

type Mode = "encrypt" | "decrypt";
type KeyType = "text" | "file";
type OutputFile = {
  filename: string;
  description: string;
  blob?: Blob;
};

export default function Home() {
  const [mode, setMode] = useState<Mode>("encrypt");
  const [keyType, setKeyType] = useState<KeyType>("text");
  const [outputs, setOutputs] = useState<OutputFile[]>([
    {
      filename: "encrypted_pack.zip",
      description: "Encrypted Pack",
    },
    { filename: "encrypted_pack.zip.key", description: "Encryption Key" },
  ]);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title()}>Secure your&nbsp;</span>
        <span className={title({ color: "violet" })}>Minecraft&nbsp;</span>
        <br />
        <span className={title()}>pack&nbsp;</span>
        <span className={title()}>with one click.</span>
        <div className={subtitle({ class: "mt-4" })}>
          Simple, fast, secure client-side file encryption.
        </div>
      </div>

      <div className="max-w-xl w-full gap-4 flex flex-col">
        <Tabs
          aria-label="Mode"
          selectedKey={mode}
          onSelectionChange={(key) => setMode(key as Mode)}
        >
          <Tab key="encrypt" title="Encrypt" />
          <Tab key="decrypt" title="Decrypt" />
        </Tabs>
        <Card>
          <CardBody className="flex flex-col">
            <Input
              isRequired
              accept=".zip,.mcaddon,.mcpack"
              description="Files are not uploaded to a server, everything is done offline in your browser."
              label="File"
              type="file"
            />

            <div className="flex flex-col gap-1">
              <Tabs
                aria-label="Key Type"
                selectedKey={keyType}
                size="sm"
                onSelectionChange={(key) => setKeyType(key as KeyType)}
                variant="underlined"
              >
                <Tab key="text" title="Text" />
                <Tab key="file" title="File" />
              </Tabs>
              {keyType === "text" && (
                <Input
                  isRequired
                  endContent={
                    <div className="flex items-center">
                      {mode === "encrypt" && (
                        <Button isIconOnly as={Link} size="sm" variant="light">
                          <RandomIcon size={20} />
                        </Button>
                      )}
                    </div>
                  }
                  label="Key"
                  placeholder="Enter your key"
                />
              )}

              {keyType === "file" && (
                <Input isRequired accept=".key" label="Key" type="file" />
              )}
            </div>
          </CardBody>
        </Card>

        <Button color="primary">
          {mode === "encrypt" ? "Encrypt" : "Decrypt"}
        </Button>

        <Divider />
        <h4 className="font-bold">Output</h4>
        <Table aria-label="Example static collection table">
          <TableHeader>
            <TableColumn>FILE NAME</TableColumn>
            <TableColumn>DESCRIPTION</TableColumn>
            <TableColumn>ACTION</TableColumn>
          </TableHeader>
          <TableBody items={outputs}>
            {(item: OutputFile) => (
              <TableRow key={item.description}>
                <TableCell className="pl-0">
                  <Code className="m-0 text-xs font-semibold">
                    {item.filename}
                  </Code>
                </TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  {" "}
                  <Link
                    isExternal
                    showAnchorIcon
                    anchorIcon={<DownloadIcon />}
                    size="sm"
                  >
                    <p>Download</p>
                  </Link>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
