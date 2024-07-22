
    <script lang="ts">
import { defineComponent, h } from 'vue';

export default defineComponent({
  props: {
    editable: {
      type: Boolean,
      default: false,
    },
    showAddButton: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['request-edit'],
  methods: {
    renderAddButton(needDisabled: boolean) {
      return h(
        'zm-button',
        {
          class: 'edit-button',
          type: 'primary',
          icon: 'zm-icon-add',
          ariaLabel: 'Edit',
          ghost: true,
          disabled: needDisabled,
          onClick: () => {
            this.$emit('request-edit');
          },
        },
        this.$t('common.btn_add')
      );
    },
    renderEditButton(needDisabled: boolean) {
      return h('zm-button', {
        class: 'edit-button',
        icon: 'zm-icon-edit',
        ariaLabel: 'Edit',
        ghost: true,
        size: 'mini',
        disabled: needDisabled,
        onClick: () => {
          this.$emit('request-edit');
        },
      });
    },
  },
  render() {
    if (this.editable && this.showAddButton) {
      return this.renderAddButton(false);
    }

    let editButtonVNode = null;
    if (this.editable) {
      editButtonVNode = this.renderEditButton(false);
    }

    return h(
      'div',
      {
        class: 'inline-editor-plain',
      },
      [
        h(
          'div',
          {
            class: 'inline-editor-plain-inner',
          },
          this.$slots.default && this.$slots.default()
        ),
        editButtonVNode,
      ]
    );
  },
});
</script>
    <style lang="scss" scoped>
        
.inline-editor-plain {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  .edit-button {
    opacity: 0;
    &:focus {
      opacity: 1;
    }
  }
  &:hover {
    .edit-button {
      opacity: 1;
    }
  }
}
.inline-editor-plain-inner {
  // flex-grow: 1;
  word-break: break-all;
  margin-right: 4px;
}

      </style>