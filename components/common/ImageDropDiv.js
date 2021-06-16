import { Form, Segment, Image, Header, Icon } from "semantic-ui-react";

const ImageDropDiv = ({
  hilighted,
  setHighlited,
  inputRef,
  handleChange,
  mediaPreview,
  setMediaPreview,
  setMedia,
}) => {
  return (
    <>
      <Form.Field>
        <Segment placeholder basic secondary>
          <input
            style={{ display: "none" }}
            type="file"
            accept="/*"
            onChange={handleChange}
            name="media"
            ref={inputRef}
          />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setHighlited(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setHighlited(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setHighlited(true);
              const droppedFile = Array.from(e.dataTransfer.files);
              setMedia(droppedFile[0]);
              setMediaPreview(URL.createObjectURL(droppedFile[0]));
              console.log(e.dataTransfer.files);
            }}
          >
            {mediaPreview === null ? (
              <>
                <Segment color={hilighted ? "green" : ""} placeholder basic>
                  <Header icon>
                    <Icon
                      name="file image outline"
                      style={{ cursor: "pointer" }}
                      onClick={() => inputRef.current.click()}
                    />
                    Drag n Drop or Click to Upload Image
                  </Header>
                </Segment>
              </>
            ) : (
              <>
                <Segment color="green" placeholder basic>
                  <Image
                    src={mediaPreview}
                    suze="medium"
                    centered
                    style={{ cursor: "pointer" }}
                    onClick={() => inputRef.current.click()}
                  />
                </Segment>
              </>
            )}
          </div>
        </Segment>
      </Form.Field>
    </>
  );
};

export default ImageDropDiv;
