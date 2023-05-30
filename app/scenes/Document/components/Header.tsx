import { observer } from "mobx-react";
import {
  TableOfContentsIcon,
  EditIcon,
  PlusIcon,
  MoonIcon,
  MoreIcon,
  SunIcon,
  TrashIcon,
} from "outline-icons";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { NavigationNode } from "@shared/types";
import { Theme } from "~/stores/UiStore";
import Document from "~/models/Document";
import { Action, Separator } from "~/components/Actions";
import Badge from "~/components/Badge";
import Button from "~/components/Button";
import Collaborators from "~/components/Collaborators";
import DocumentBreadcrumb from "~/components/DocumentBreadcrumb";
import Header from "~/components/Header";
import Tooltip from "~/components/Tooltip";
import { publishDocument } from "~/actions/definitions/documents";
import { restoreRevision } from "~/actions/definitions/revisions";
import useActionContext from "~/hooks/useActionContext";
import useMobile from "~/hooks/useMobile";
import usePolicy from "~/hooks/usePolicy";
import useStores from "~/hooks/useStores";
import DocumentMenu from "~/menus/DocumentMenu";
import NewChildDocumentMenu from "~/menus/NewChildDocumentMenu";
import TableOfContentsMenu from "~/menus/TableOfContentsMenu";
import TemplatesMenu from "~/menus/TemplatesMenu";
import { metaDisplay } from "~/utils/keyboard";
import { newDocumentPath, documentEditPath } from "~/utils/routeHelpers";
import ObservingBanner from "./ObservingBanner";
import PublicBreadcrumb from "./PublicBreadcrumb";
import ShareButton from "./ShareButton";

type Props = {
  document: Document;
  documentHasHeadings: boolean;
  sharedTree: NavigationNode | undefined;
  shareId: string | null | undefined;
  isDraft: boolean;
  isEditing: boolean;
  isRevision: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  publishingIsDisabled: boolean;
  savingIsDisabled: boolean;
  onSelectTemplate: (template: Document) => void;
  onSave: (options: {
    done?: boolean;
    publish?: boolean;
    autosave?: boolean;
  }) => void;
  headings: {
    title: string;
    level: number;
    id: string;
  }[];
  editCover: any;
  positionX: any;
  positionY: any;
  handleEditCover: any;
  handleCoverImg: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveCoverImg: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCoverPosition: any;
};

function DocumentHeader({
  document,
  documentHasHeadings,
  shareId,
  isEditing,
  isDraft,
  isPublishing,
  isRevision,
  isSaving,
  savingIsDisabled,
  publishingIsDisabled,
  sharedTree,
  onSelectTemplate,
  onSave,
  headings,
  editCover,
  handleEditCover,
  handleCoverImg,
  handleRemoveCoverImg,
  handleCoverPosition,
  positionX,
  positionY,
}: Props) {
  const { t } = useTranslation();
  const { ui, auth } = useStores();
  const { resolvedTheme } = ui;
  const { team } = auth;
  const isMobile = useMobile();
  let inputRef: HTMLInputElement | null = null;

  // We cache this value for as long as the component is mounted so that if you
  // apply a template there is still the option to replace it until the user
  // navigates away from the doc
  const [isNew] = React.useState(document.isPersistedOnce);

  const handleSave = React.useCallback(() => {
    onSave({
      done: true,
    });
  }, [onSave]);

  const context = useActionContext({
    activeDocumentId: document?.id,
  });

  const { isDeleted, isTemplate } = document;
  const can = usePolicy(document?.id);
  const canToggleEmbeds = team?.documentEmbeds;
  const canEdit = can.update && !isEditing;
  const toc = (
    <Tooltip
      tooltip={ui.tocVisible ? t("Hide contents") : t("Show contents")}
      shortcut="ctrl+alt+h"
      delay={250}
      placement="bottom"
    >
      <Button
        onClick={
          ui.tocVisible ? ui.hideTableOfContents : ui.showTableOfContents
        }
        icon={<TableOfContentsIcon />}
        borderOnHover
        neutral
      />
    </Tooltip>
  );
  const editAction = (
    <Action>
      <Tooltip
        tooltip={t("Edit {{noun}}", {
          noun: document.noun,
        })}
        shortcut="e"
        delay={500}
        placement="bottom"
      >
        <Button
          as={Link}
          icon={<EditIcon />}
          to={documentEditPath(document)}
          neutral
        >
          {t("Edit")}
        </Button>
      </Tooltip>
    </Action>
  );
  const appearanceAction = (
    <Action>
      <Tooltip
        tooltip={
          resolvedTheme === "light" ? t("Switch to dark") : t("Switch to light")
        }
        delay={500}
        placement="bottom"
      >
        <Button
          icon={resolvedTheme === "light" ? <SunIcon /> : <MoonIcon />}
          onClick={() =>
            ui.setTheme(resolvedTheme === "light" ? Theme.Dark : Theme.Light)
          }
          neutral
          borderOnHover
        />
      </Tooltip>
    </Action>
  );

  if (shareId) {
    return (
      <Header
        title={document.title}
        hasSidebar={!!sharedTree}
        left={
          isMobile ? (
            <TableOfContentsMenu headings={headings} />
          ) : (
            <PublicBreadcrumb
              documentId={document.id}
              shareId={shareId}
              sharedTree={sharedTree}
            >
              {documentHasHeadings ? toc : null}
            </PublicBreadcrumb>
          )
        }
        actions={
          <>
            {appearanceAction}
            {canEdit ? editAction : <div />}
          </>
        }
      />
    );
  }

  return (
    <>
      <Header
        hasSidebar
        left={
          isMobile ? (
            <TableOfContentsMenu headings={headings} />
          ) : (
            <DocumentBreadcrumb document={document}>{toc}</DocumentBreadcrumb>
          )
        }
        title={
          <>
            {document.title}{" "}
            {document.isArchived && (
              <ArchivedBadge>{t("Archived")}</ArchivedBadge>
            )}
          </>
        }
        actions={
          <>
            <ObservingBanner />

            {!isPublishing && isSaving && !team?.seamlessEditing && (
              <Status>{t("Saving")}…</Status>
            )}
            {!isDeleted && !isRevision && <Collaborators document={document} />}
            {(isEditing || team?.seamlessEditing) && !isTemplate && isNew && (
              <Action>
                <TemplatesMenu
                  document={document}
                  onSelectTemplate={onSelectTemplate}
                />
              </Action>
            )}
            {!isEditing &&
              !isDeleted &&
              !isRevision &&
              (!isMobile || !isTemplate) &&
              document.collectionId && (
                <Action>
                  <ShareButton document={document} />
                </Action>
              )}
            {isEditing && (
              <>
                <Action>
                  <Tooltip
                    tooltip={t("Save")}
                    shortcut={`${metaDisplay}+enter`}
                    delay={500}
                    placement="bottom"
                  >
                    <Button
                      onClick={handleSave}
                      disabled={savingIsDisabled}
                      neutral={isDraft}
                    >
                      {isDraft ? t("Save Draft") : t("Done Editing")}
                    </Button>
                  </Tooltip>
                </Action>
              </>
            )}
            {canEdit && !team?.seamlessEditing && !isRevision && editAction}
            {canEdit && can.createChildDocument && !isRevision && !isMobile && (
              <Action>
                <NewChildDocumentMenu
                  document={document}
                  label={(props) => (
                    <Tooltip
                      tooltip={t("New document")}
                      shortcut="n"
                      delay={500}
                      placement="bottom"
                    >
                      <Button icon={<PlusIcon />} {...props} neutral>
                        {t("New doc")}
                      </Button>
                    </Tooltip>
                  )}
                />
              </Action>
            )}
            {canEdit && can.createChildDocument && !isMobile && (
              <>
                <Button
                  icon={document.coverImg ? <EditIcon /> : <PlusIcon />}
                  onClick={() => {
                    if (document.coverImg && !editCover) {
                      handleEditCover(!editCover);
                    } else {
                      inputRef && inputRef.click();
                    }
                  }}
                  style={{ marginLeft: 12 }}
                  neutral
                >
                  {editCover
                    ? "Upload new image"
                    : document.coverImg
                    ? "Edit cover"
                    : t("Upload cover")}
                </Button>
                <input
                  type="file"
                  hidden
                  onChange={handleCoverImg}
                  ref={(refParam) => (inputRef = refParam)}
                />
              </>
            )}
            {editCover && (
              <Button
                // icon={<TrashIcon />}
                onClick={() => {
                  handleEditCover(false);
                  handleCoverPosition(positionX, positionY);
                }}
                style={{ marginLeft: 12 }}
                // danger
              >
                Save cover
              </Button>
            )}
            {canEdit &&
              can.createChildDocument &&
              !isMobile &&
              document.coverImg && (
                <>
                  <Button
                    icon={<TrashIcon />}
                    onClick={handleRemoveCoverImg}
                    style={{ marginLeft: 12 }}
                    danger
                  >
                    {t("Remove Cover")}
                  </Button>
                </>
              )}
            {canEdit && isTemplate && !isDraft && !isRevision && (
              <Action>
                <Button
                  icon={<PlusIcon />}
                  as={Link}
                  to={newDocumentPath(document.collectionId, {
                    templateId: document.id,
                  })}
                >
                  {t("New from template")}
                </Button>
              </Action>
            )}
            {isRevision && (
              <Action>
                <Tooltip
                  tooltip={t("Restore version")}
                  delay={500}
                  placement="bottom"
                >
                  <Button
                    action={restoreRevision}
                    context={context}
                    neutral
                    hideOnActionDisabled
                  >
                    {t("Restore")}
                  </Button>
                </Tooltip>
              </Action>
            )}
            <Action>
              <Button
                action={publishDocument}
                context={context}
                disabled={publishingIsDisabled}
                hideOnActionDisabled
                hideIcon
              >
                {document.collectionId ? t("Publish") : `${t("Publish")}…`}
              </Button>
            </Action>
            {!isEditing && (
              <>
                {!isDeleted && <Separator />}
                <Action>
                  <DocumentMenu
                    document={document}
                    isRevision={isRevision}
                    label={(props) => (
                      <Button
                        icon={<MoreIcon />}
                        {...props}
                        borderOnHover
                        neutral
                      />
                    )}
                    showToggleEmbeds={canToggleEmbeds}
                    showDisplayOptions
                  />
                </Action>
              </>
            )}
          </>
        }
      />
    </>
  );
}

const ArchivedBadge = styled(Badge)`
  position: absolute;
`;

const Status = styled(Action)`
  padding-left: 0;
  padding-right: 4px;
  color: ${(props) => props.theme.slate};
`;

export default observer(DocumentHeader);
