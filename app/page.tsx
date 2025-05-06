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
import { decryptPack, encryptPack, KEY_LENGTH, randomKey } from "@/lib/crypto";

type Mode = "encrypt" | "decrypt";
type OutputFile = {
  filename: string;
  description: string;
  blob: Blob;
};

export default function Home() {
  const [mode, setMode] = useState<Mode>("encrypt");
  const [file, setFile] = useState<File | null>(null);
  const [key, setKey] = useState<string>("");
  const [outputs, setOutputs] = useState<OutputFile[]>([]);
  const [busy, setBusy] = useState<boolean>(false);

  const processPack = async () => {
    if (!file) return alert("Please select a pack file.");
    //TODO: check key length == 32

    setBusy(true);
    const buffer = await file.arrayBuffer();

    let files: OutputFile[] = [];
    let zipBlob: Blob;

    if (mode === "encrypt") {
      zipBlob = await encryptPack(buffer, key);
      files.push({
        filename: "encrypted_" + file.name,
        description: "Encrypted Pack",
        blob: zipBlob,
      });
      files.push({
        filename: "encrypted_" + file.name + ".key",
        description: "Encryption Key",
        blob: new Blob([key], { type: "text/plain" }),
      });
    } else {
      zipBlob = await decryptPack(buffer, key);
      files.push({
        filename: "decrypted_" + file.name,
        description: "Decrypted Pack",
        blob: zipBlob,
      });
    }

    setOutputs(files);
    setBusy(false);
  };

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
          <CardBody className="flex flex-col gap-4">
            <Input
              isRequired
              accept=".zip,.mcaddon,.mcpack"
              description="Files are not uploaded to a server, everything is done offline in your browser."
              label="File"
              type="file"
              onChange={(e) => {
                if (e.target.files) setFile(e.target.files[0]);
              }}
            />

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
                      onPress={() => setKey(randomKey())}
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
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </CardBody>
        </Card>

        <Button color="primary" isLoading={busy} onPress={processPack}>
          {mode === "encrypt" ? "Encrypt" : "Decrypt"}
        </Button>

        <Divider />
        <h4 className="font-bold">Output</h4>
        <Table aria-label="Output files">
          <TableHeader>
            <TableColumn>FILE NAME</TableColumn>
            <TableColumn className="w-[10rem]">DESCRIPTION</TableColumn>
            <TableColumn align="center" className="w-[5rem]">
              ACTION
            </TableColumn>
          </TableHeader>
          <TableBody items={outputs}>
            {(item: OutputFile) => (
              <TableRow key={item.description}>
                <TableCell>
                  <p className="text-xs font-semibold break-all line-clamp-2 font-mono">
                    {item.filename}
                  </p>
                </TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  <Link
                    isExternal
                    showAnchorIcon
                    anchorIcon={<DownloadIcon />}
                    color="foreground"
                    download={item.filename}
                    href={URL.createObjectURL(item.blob)}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
