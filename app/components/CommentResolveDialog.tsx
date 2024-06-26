import { observer } from "mobx-react";
import * as React from "react";
import { useTranslation, Trans } from "react-i18next";
import { toast } from "sonner";
import Comment from "~/models/Comment";
import ConfirmationDialog from "~/components/ConfirmationDialog";
import Text from "~/components/Text";
import useCurrentUser from "~/hooks/useCurrentUser";
import useStores from "~/hooks/useStores";

type Props = {
  comment: Comment;
  onSubmit?: () => void;
};

function CommentResolveDialog({ comment, onSubmit }: Props) {
  const { comments } = useStores();
  const user = useCurrentUser();
  const { t } = useTranslation();
  const hasChildComments = comments.inThread(comment.id).length > 1;

  const handleSubmit = async () => {
    try {
      await comment.resolve(user);
      onSubmit?.();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <ConfirmationDialog
      onSubmit={handleSubmit}
      submitText={t("I’m sure – Resolve")}
      savingText={`${t("Resolving")}…`}
      danger
    >
      <Text type="secondary">
        {hasChildComments ? (
          <Trans>
            Are you sure you want to resolve this entire comment thread?
          </Trans>
        ) : (
          <Trans>Are you sure you want to resolve this comment?</Trans>
        )}
      </Text>
    </ConfirmationDialog>
  );
}

export default observer(CommentResolveDialog);
