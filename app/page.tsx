"use client";

import { Tabs, Tab } from "@heroui/tabs";
import { Card, CardBody } from "@heroui/card";
import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
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

import { DownloadIcon, RandomIcon } from "@/components/icons";
import { title, subtitle } from "@/components/primitives";
import { KEY_LENGTH, randomKey } from "@/lib/crypto";

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
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [textKey, setTextKey] = useState<string>("");
  const [fileKey, setFileKey] = useState<File | null>(null);
  const [outputs, setOutputs] = useState<OutputFile[]>([]);

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
          onSelectionChange={(key) => {
            setMode(key as Mode);
          }}
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
              onChange={(e) => {
                if (e.target.files) setZipFile(e.target.files[0]);
              }}
            />

            <div className="flex flex-col gap-1">
              <Tabs
                aria-label="Key Type"
                selectedKey={keyType}
                size="sm"
                variant="underlined"
                onSelectionChange={(key) => setKeyType(key as KeyType)}
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
                        <Button
                          isIconOnly
                          as={Link}
                          size="sm"
                          variant="light"
                          onPress={() => {
                            setTextKey(randomKey());
                            setFileKey(null);
                          }}
                        >
                          <RandomIcon size={20} />
                        </Button>
                      )}
                    </div>
                  }
                  label="Key"
                  maxLength={KEY_LENGTH}
                  minLength={KEY_LENGTH}
                  placeholder="Enter your key"
                  value={textKey}
                  onChange={(e) => {
                    setTextKey(e.target.value);
                    setFileKey(null);
                  }}
                />
              )}

              {keyType === "file" && (
                <Input
                  isRequired
                  accept=".key"
                  label="Key"
                  type="file"
                  onChange={(e) => {
                    setTextKey("");
                    if (e.target.files) setFileKey(e.target.files[0]);
                  }}
                />
              )}
            </div>
          </CardBody>
        </Card>

        <Button color="primary">
          {mode === "encrypt" ? "Encrypt" : "Decrypt"}
        </Button>

        <Divider />
        <h4 className="font-bold">Output</h4>
        <Table aria-label="Output files">
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
